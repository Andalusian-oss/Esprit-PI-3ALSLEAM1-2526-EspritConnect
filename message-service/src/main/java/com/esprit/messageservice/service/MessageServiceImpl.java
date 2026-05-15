package com.esprit.messageservice.service;

import com.esprit.messageservice.dto.request.MessageRequestDTO;
import com.esprit.messageservice.dto.response.*;
import com.esprit.messageservice.entity.*;
import com.esprit.messageservice.exception.ResourceNotFoundException;
import com.esprit.messageservice.repository.*;
import lombok.RequiredArgsConstructor;
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

        // Create notification
        Notification notification = Notification.builder()
                .recipientUserId(recipientId)
                .type("NEW_MESSAGE")
                .message("New message from user " + senderId)
                .build();
        notificationRepository.save(notification);

        return responseDTO;
    }

    @Override
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
            System.err.println("Failed to resolve user names: " + e.getMessage());
        }
        return Collections.emptyMap();
    }

    @Override
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
    public List<NotificationResponseDTO> getMyNotifications(Long userId) {
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toNotificationDTO).collect(Collectors.toList());
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
                .contenu(m.getContenu()).lu(m.getLu()).createdAt(m.getCreatedAt()).build();
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

    private NotificationResponseDTO toNotificationDTO(Notification n) {
        return NotificationResponseDTO.builder().id(n.getId())
                .recipientUserId(n.getRecipientUserId()).type(n.getType())
                .message(n.getMessage()).lu(n.getLu()).createdAt(n.getCreatedAt()).build();
    }
}
