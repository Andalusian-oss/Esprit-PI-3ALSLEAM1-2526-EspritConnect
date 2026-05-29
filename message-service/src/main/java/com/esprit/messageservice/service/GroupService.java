package com.esprit.messageservice.service;

import com.esprit.messageservice.dto.request.GroupCreateRequestDTO;
import com.esprit.messageservice.dto.request.GroupMessageRequestDTO;
import com.esprit.messageservice.dto.response.GroupMessageResponseDTO;
import com.esprit.messageservice.dto.response.GroupResponseDTO;
import java.util.List;

public interface GroupService {
    GroupResponseDTO createGroup(GroupCreateRequestDTO dto, Long creatorId);
    List<GroupResponseDTO> getMyGroups(Long userId);
    GroupResponseDTO getGroup(Long groupId, Long userId);
    GroupResponseDTO addMember(Long groupId, Long targetUserId, Long requesterId);
    void removeMember(Long groupId, Long targetUserId, Long requesterId);
    void deleteGroup(Long groupId, Long requesterId);

    GroupMessageResponseDTO sendGroupMessage(Long groupId, GroupMessageRequestDTO dto, Long senderId);
    List<GroupMessageResponseDTO> getGroupMessages(Long groupId, Long userId);
    GroupMessageResponseDTO editGroupMessage(Long messageId, String contenu, Long userId);
    void deleteGroupMessage(Long messageId, Long userId);
}
