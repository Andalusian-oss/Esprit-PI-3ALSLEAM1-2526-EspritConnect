package com.esprit.messageservice.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponseDTO {
    private Long id;
    private Long recipientUserId;
    private String type;
    private String message;
    private Boolean lu;
    private LocalDateTime createdAt;
}
