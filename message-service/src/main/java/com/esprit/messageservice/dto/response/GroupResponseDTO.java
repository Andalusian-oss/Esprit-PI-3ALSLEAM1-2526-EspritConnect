package com.esprit.messageservice.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class GroupResponseDTO {
    private Long id;
    private String name;
    private String avatarUrl;
    private Long creatorUserId;
    private LocalDateTime createdAt;
    private int memberCount;
    private List<GroupMemberResponseDTO> members;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
}
