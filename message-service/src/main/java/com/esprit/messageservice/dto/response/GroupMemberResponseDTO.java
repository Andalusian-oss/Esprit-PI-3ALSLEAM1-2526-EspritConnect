package com.esprit.messageservice.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class GroupMemberResponseDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String role;
    private LocalDateTime joinedAt;
}
