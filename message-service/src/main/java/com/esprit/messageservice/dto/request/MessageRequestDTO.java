package com.esprit.messageservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MessageRequestDTO {
    @NotNull(message = "Recipient user ID is required")
    private Long recipientUserId;
    @NotBlank(message = "Message content is required")
    private String contenu;
}
