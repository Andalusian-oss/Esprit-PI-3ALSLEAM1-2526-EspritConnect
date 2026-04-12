package com.esprit.messageservice.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConversationResponseDTO {
    private Long id;
    private Long participant1UserId;
    private Long participant2UserId;
    private int messageCount;
    private int unreadCount;
}
