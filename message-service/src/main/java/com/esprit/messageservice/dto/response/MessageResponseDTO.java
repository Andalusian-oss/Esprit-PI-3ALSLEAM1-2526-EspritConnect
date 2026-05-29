package com.esprit.messageservice.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponseDTO {
    private Long id;
    private Long conversationId;
    private Long senderUserId;
    private String contenu;
    private Boolean lu;
    private Boolean edited;
    private LocalDateTime editedAt;
    private LocalDateTime createdAt;
}
