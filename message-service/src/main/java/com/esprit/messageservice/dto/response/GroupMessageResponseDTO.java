package com.esprit.messageservice.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class GroupMessageResponseDTO {
    private Long id;
    private Long groupId;
    private Long senderUserId;
    private String senderName;
    private String contenu;
    private Boolean edited;
    private LocalDateTime editedAt;
    private LocalDateTime createdAt;
}
