package com.esprit.messageservice.service;

import com.esprit.messageservice.dto.request.MessageRequestDTO;
import com.esprit.messageservice.dto.response.*;
import com.esprit.messageservice.entity.*;
import com.esprit.messageservice.exception.ResourceNotFoundException;
import com.esprit.messageservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageServiceImpl implements MessageService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RestTemplate restTemplate;

    // Internal DTO for mapping auth-service response
    @lombok.Data
    @lombok.NoArgsConstructor
    private static class AuthUserDTO {
        private Long id;
        private String prenom;
        private String nom;
    }

    @Override
    @Transactional
    public MessageResponseDTO sendMessage(MessageRequestDTO dto, Long senderId) {
        Long recipientId = dto.getRecipientUserId();

        // Find or create conversation (normalize order so p1 < p2)
        Long p1 = Math.min(senderId, recipientId);
        Long p2 = Math.max(senderId, recipientId);

        Conversation conversation = conversationRepository
                .findByParticipant1UserIdAndParticipant2UserId(p1, p2)
                .orElseGet(() -> conversationRepository.save(
                        Conversation.builder().participant1UserId(p1).participant2UserId(p2).build()));

        Message message = Message.builder()
                .conversation(conversation)
                .senderUserId(senderId)
                .contenu(dto.getContenu())
                .build();
        Message saved = messageRepository.save(message);

        MessageResponseDTO responseDTO = toMessageDTO(saved);

        // Push via WebSocket to recipient
        messagingTemplate.convertAndSendToUser(
                recipientId.toString(), "/queue/messages", responseDTO);

        // Create notification — show the sender's name, not their numeric id
        String senderName = resolveNames(Set.of(senderId)).getOrDefault(senderId, "User #" + senderId);
        Notification notification = Notification.builder()
                .recipientUserId(recipientId)
                .type("NEW_MESSAGE")
                .message("New message from " + senderName)
                .build();
        notificationRepository.save(notification);

        return responseDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponseDTO> getMyConversations(Long userId) {
        List<Conversation> conversations = conversationRepository.findByParticipant1UserIdOrParticipant2UserId(userId, userId);
        
        // Collect all participant IDs for bulk resolution
        Set<Long> ids = new HashSet<>();
        conversations.forEach(c -> {
            ids.add(c.getParticipant1UserId());
            ids.add(c.getParticipant2UserId());
        });
        
        Map<Long, String> nameMap = resolveNames(ids);

        return conversations.stream()
                .map(c -> {
                    ConversationResponseDTO dto = toConversationDTO(c, userId);
                    dto.setParticipant1Name(nameMap.getOrDefault(dto.getParticipant1UserId(), "User #" + dto.getParticipant1UserId()));
                    dto.setParticipant2Name(nameMap.getOrDefault(dto.getParticipant2UserId(), "User #" + dto.getParticipant2UserId()));
                    return dto;
                })
                .sorted((c1, c2) -> {
                    if (c1.getLastMessageAt() == null) return 1;
                    if (c2.getLastMessageAt() == null) return -1;
                    return c2.getLastMessageAt().compareTo(c1.getLastMessageAt());
                })
                .collect(Collectors.toList());
    }

    private Map<Long, String> resolveNames(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) return Collections.emptyMap();
        try {
            String query = ids.stream()
                .map(id -> "ids=" + id)
                .collect(Collectors.joining("&"));
            String url = "http://auth-service:8081/api/auth/users/bulk?" + query;
            
            ResponseEntity<List<AuthUserDTO>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<AuthUserDTO>>() {}
            );
            
            if (response.getBody() != null) {
                return response.getBody().stream()
                    .collect(Collectors.toMap(
                        AuthUserDTO::getId,
                        u -> u.getPrenom() + " " + u.getNom(),
                        (v1, v2) -> v1 // handle duplicates
                    ));
            }
        } catch (Exception e) {
            log.error("Failed to resolve user names: {}", e.getMessage(), e);
        }
        return Collections.emptyMap();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponseDTO> getMessages(Long conversationId, Long userId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream().map(this::toMessageDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long conversationId, Long userId) {
        messageRepository.markAllAsRead(conversationId, userId);
    }

    @Override
    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));
        if (!msg.getSenderUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        messageRepository.delete(msg);
    }

    @Override
    @Transactional
    public MessageResponseDTO editMessage(Long messageId, String contenu, Long userId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));
        if (!msg.getSenderUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        msg.setContenu(contenu);
        msg.setEdited(true);
        msg.setEditedAt(java.time.LocalDateTime.now());
        Message saved = messageRepository.save(msg);
        MessageResponseDTO dto = toMessageDTO(saved);
        // Push edit event to the other participant
        Long convId = saved.getConversation().getId();
        Conversation conv = saved.getConversation();
        Long otherId = conv.getParticipant1UserId().equals(userId)
                ? conv.getParticipant2UserId() : conv.getParticipant1UserId();
        messagingTemplate.convertAndSendToUser(otherId.toString(), "/queue/messages/edit", dto);
        return dto;
    }

    @Override
    @Transactional
    public void deleteConversation(Long conversationId, Long userId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));
        if (!conv.getParticipant1UserId().equals(userId) && !conv.getParticipant2UserId().equals(userId))
            throw new IllegalArgumentException("Not authorized");
        conversationRepository.delete(conv);
    }

    // Matches legacy notification text that embedded a raw user id, e.g. "... user 22"
    private static final java.util.regex.Pattern USER_ID_PATTERN =
            java.util.regex.Pattern.compile("\\buser\\s+(\\d+)\\b", java.util.regex.Pattern.CASE_INSENSITIVE);

    @Override
    public List<NotificationResponseDTO> getMyNotifications(Long userId) {
        List<Notification> notifs = notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId);

        // Collect ids embedded in older notifications so we can show names instead of "user <id>"
        Set<Long> ids = new HashSet<>();
        for (Notification n : notifs) {
            if (n.getMessage() == null) continue;
            java.util.regex.Matcher m = USER_ID_PATTERN.matcher(n.getMessage());
            while (m.find()) ids.add(Long.parseLong(m.group(1)));
        }
        Map<Long, String> nameMap = resolveNames(ids);

        return notifs.stream()
                .map(n -> toNotificationDTO(n, nameMap))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markNotificationRead(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        if (!n.getRecipientUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        n.setLu(true);
        notificationRepository.save(n);
    }

    @Override
    public long countUnreadNotifications(Long userId) {
        return notificationRepository.countByRecipientUserIdAndLuFalse(userId);
    }

    private MessageResponseDTO toMessageDTO(Message m) {
        return MessageResponseDTO.builder().id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderUserId(m.getSenderUserId())
                .contenu(m.getContenu()).lu(m.getLu())
                .edited(m.getEdited()).editedAt(m.getEditedAt())
                .createdAt(m.getCreatedAt()).build();
    }

    private ConversationResponseDTO toConversationDTO(Conversation c, Long userId) {
        long unread = messageRepository.countByConversationIdAndLuFalseAndSenderUserIdNot(c.getId(), userId);
        
        // Get last message info
        Message last = null;
        if (c.getMessages() != null && !c.getMessages().isEmpty()) {
            last = c.getMessages().get(c.getMessages().size() - 1);
        }

        return ConversationResponseDTO.builder().id(c.getId())
                .participant1UserId(c.getParticipant1UserId())
                .participant2UserId(c.getParticipant2UserId())
                .messageCount(c.getMessages().size())
                .unreadCount((int) unread)
                .lastMessage(last != null ? last.getContenu() : null)
                .lastMessageAt(last != null ? last.getCreatedAt() : null)
                .build();
    }

    private NotificationResponseDTO toNotificationDTO(Notification n, Map<Long, String> nameMap) {
        String message = n.getMessage();
        // Rewrite any legacy "user <id>" with the resolved username when available
        if (message != null && nameMap != null && !nameMap.isEmpty()) {
            java.util.regex.Matcher m = USER_ID_PATTERN.matcher(message);
            StringBuffer sb = new StringBuffer();
            while (m.find()) {
                String name = nameMap.get(Long.parseLong(m.group(1)));
                m.appendReplacement(sb, java.util.regex.Matcher.quoteReplacement(name != null ? name : m.group(0)));
            }
            m.appendTail(sb);
            message = sb.toString();
        }
        return NotificationResponseDTO.builder().id(n.getId())
                .recipientUserId(n.getRecipientUserId()).type(n.getType())
                .message(message).lu(n.getLu()).createdAt(n.getCreatedAt()).build();
    }
}
