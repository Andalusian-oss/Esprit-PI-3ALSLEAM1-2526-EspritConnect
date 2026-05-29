package com.esprit.messageservice.service;

import com.esprit.messageservice.dto.request.GroupCreateRequestDTO;
import com.esprit.messageservice.dto.request.GroupMessageRequestDTO;
import com.esprit.messageservice.dto.response.GroupMemberResponseDTO;
import com.esprit.messageservice.dto.response.GroupMessageResponseDTO;
import com.esprit.messageservice.dto.response.GroupResponseDTO;
import com.esprit.messageservice.entity.*;
import com.esprit.messageservice.exception.ResourceNotFoundException;
import com.esprit.messageservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupMessageRepository groupMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RestTemplate restTemplate;

    @lombok.Data @lombok.NoArgsConstructor
    private static class AuthUserDTO {
        private Long id;
        private String prenom;
        private String nom;
    }

    private Map<Long, String> resolveNames(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) return Collections.emptyMap();
        try {
            String query = ids.stream().map(id -> "ids=" + id).collect(Collectors.joining("&"));
            ResponseEntity<List<AuthUserDTO>> resp = restTemplate.exchange(
                    "http://auth-service:8081/api/auth/users/bulk?" + query,
                    HttpMethod.GET, null, new ParameterizedTypeReference<List<AuthUserDTO>>() {});
            if (resp.getBody() != null) {
                return resp.getBody().stream().collect(Collectors.toMap(
                        AuthUserDTO::getId, u -> u.getPrenom() + " " + u.getNom(), (a, b) -> a));
            }
        } catch (Exception e) {
            log.error("Failed to resolve names: {}", e.getMessage(), e);
        }
        return Collections.emptyMap();
    }

    @Override
    @Transactional
    public GroupResponseDTO createGroup(GroupCreateRequestDTO dto, Long creatorId) {
        Group group = Group.builder()
                .name(dto.getName())
                .avatarUrl(dto.getAvatarUrl())
                .creatorUserId(creatorId)
                .build();
        Group saved = groupRepository.save(group);

        // Add creator as ADMIN
        groupMemberRepository.save(GroupMember.builder()
                .group(saved).userId(creatorId).role(GroupMember.MemberRole.ADMIN).build());

        // Add initial members
        if (dto.getMemberIds() != null) {
            dto.getMemberIds().stream()
                    .filter(id -> !id.equals(creatorId))
                    .forEach(id -> groupMemberRepository.save(
                            GroupMember.builder().group(saved).userId(id)
                                    .role(GroupMember.MemberRole.MEMBER).build()));
        }

        // Notify all members via WebSocket
        List<GroupMember> members = groupMemberRepository.findByGroupId(saved.getId());
        GroupResponseDTO response = toGroupDTO(saved, members, Collections.emptyMap());
        members.forEach(m -> messagingTemplate.convertAndSendToUser(
                m.getUserId().toString(), "/queue/groups/invite", response));

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupResponseDTO> getMyGroups(Long userId) {
        List<Group> groups = groupRepository.findGroupsByUserId(userId);
        return groups.stream().map(g -> {
            List<GroupMember> members = groupMemberRepository.findByGroupId(g.getId());
            Set<Long> ids = members.stream().map(GroupMember::getUserId).collect(Collectors.toSet());
            Map<Long, String> names = resolveNames(ids);
            return toGroupDTO(g, members, names);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GroupResponseDTO getGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found: " + groupId));
        assertMember(groupId, userId);
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        Set<Long> ids = members.stream().map(GroupMember::getUserId).collect(Collectors.toSet());
        return toGroupDTO(group, members, resolveNames(ids));
    }

    @Override
    @Transactional
    public GroupResponseDTO addMember(Long groupId, Long targetUserId, Long requesterId) {
        assertAdmin(groupId, requesterId);
        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, targetUserId))
            throw new IllegalArgumentException("User already a member");
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found: " + groupId));
        groupMemberRepository.save(GroupMember.builder()
                .group(group).userId(targetUserId).role(GroupMember.MemberRole.MEMBER).build());
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        Set<Long> ids = members.stream().map(GroupMember::getUserId).collect(Collectors.toSet());
        GroupResponseDTO dto = toGroupDTO(group, members, resolveNames(ids));
        // Notify new member
        messagingTemplate.convertAndSendToUser(targetUserId.toString(), "/queue/groups/invite", dto);
        return dto;
    }

    @Override
    @Transactional
    public void removeMember(Long groupId, Long targetUserId, Long requesterId) {
        // Admin can remove anyone; members can remove themselves
        if (!requesterId.equals(targetUserId)) assertAdmin(groupId, requesterId);
        groupMemberRepository.deleteByGroupIdAndUserId(groupId, targetUserId);
    }

    @Override
    @Transactional
    public void deleteGroup(Long groupId, Long requesterId) {
        assertAdmin(groupId, requesterId);
        groupRepository.deleteById(groupId);
    }

    @Override
    @Transactional
    public GroupMessageResponseDTO sendGroupMessage(Long groupId, GroupMessageRequestDTO dto, Long senderId) {
        assertMember(groupId, senderId);
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found: " + groupId));
        GroupMessage msg = GroupMessage.builder()
                .group(group).senderUserId(senderId).contenu(dto.getContenu()).build();
        GroupMessage saved = groupMessageRepository.save(msg);

        Map<Long, String> names = resolveNames(Set.of(senderId));
        GroupMessageResponseDTO response = toGroupMessageDTO(saved, names);

        messagingTemplate.convertAndSend("/topic/group/" + groupId, response);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupMessageResponseDTO> getGroupMessages(Long groupId, Long userId) {
        assertMember(groupId, userId);
        List<GroupMessage> messages = groupMessageRepository.findByGroupIdOrderByCreatedAtAsc(groupId);
        Set<Long> ids = messages.stream().map(GroupMessage::getSenderUserId).collect(Collectors.toSet());
        Map<Long, String> names = resolveNames(ids);
        return messages.stream().map(m -> toGroupMessageDTO(m, names)).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GroupMessageResponseDTO editGroupMessage(Long messageId, String contenu, Long userId) {
        GroupMessage msg = groupMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));
        if (!msg.getSenderUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        msg.setContenu(contenu);
        msg.setEdited(true);
        msg.setEditedAt(LocalDateTime.now());
        GroupMessage saved = groupMessageRepository.save(msg);
        Map<Long, String> names = resolveNames(Set.of(userId));
        GroupMessageResponseDTO dto = toGroupMessageDTO(saved, names);
        messagingTemplate.convertAndSend("/topic/group/" + saved.getGroup().getId() + "/edit", dto);
        return dto;
    }

    @Override
    @Transactional
    public void deleteGroupMessage(Long messageId, Long userId) {
        GroupMessage msg = groupMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));
        Long groupId = msg.getGroup().getId();
        // Allow sender or group admin to delete
        boolean isAdmin = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .map(m -> m.getRole() == GroupMember.MemberRole.ADMIN).orElse(false);
        if (!msg.getSenderUserId().equals(userId) && !isAdmin)
            throw new IllegalArgumentException("Not authorized");
        groupMessageRepository.delete(msg);
        messagingTemplate.convertAndSend("/topic/group/" + groupId + "/delete", Map.of("messageId", messageId));
    }

    private void assertMember(Long groupId, Long userId) {
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, userId))
            throw new IllegalArgumentException("Not a group member");
    }

    private void assertAdmin(Long groupId, Long userId) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Not a group member"));
        if (member.getRole() != GroupMember.MemberRole.ADMIN)
            throw new IllegalArgumentException("Admin privileges required");
    }

    private GroupResponseDTO toGroupDTO(Group g, List<GroupMember> members, Map<Long, String> names) {
        List<GroupMemberResponseDTO> memberDTOs = members.stream().map(m ->
                GroupMemberResponseDTO.builder()
                        .id(m.getId()).userId(m.getUserId())
                        .userName(names.getOrDefault(m.getUserId(), "User #" + m.getUserId()))
                        .role(m.getRole().name()).joinedAt(m.getJoinedAt())
                        .build()
        ).collect(Collectors.toList());

        // Get last message
        List<GroupMessage> msgs = g.getMessages();
        GroupMessage last = msgs.isEmpty() ? null : msgs.get(msgs.size() - 1);

        return GroupResponseDTO.builder()
                .id(g.getId()).name(g.getName()).avatarUrl(g.getAvatarUrl())
                .creatorUserId(g.getCreatorUserId()).createdAt(g.getCreatedAt())
                .memberCount(members.size()).members(memberDTOs)
                .lastMessage(last != null ? last.getContenu() : null)
                .lastMessageAt(last != null ? last.getCreatedAt() : null)
                .build();
    }

    private GroupMessageResponseDTO toGroupMessageDTO(GroupMessage m, Map<Long, String> names) {
        return GroupMessageResponseDTO.builder()
                .id(m.getId()).groupId(m.getGroup().getId())
                .senderUserId(m.getSenderUserId())
                .senderName(names.getOrDefault(m.getSenderUserId(), "User #" + m.getSenderUserId()))
                .contenu(m.getContenu()).edited(m.getEdited()).editedAt(m.getEditedAt())
                .createdAt(m.getCreatedAt()).build();
    }
}
