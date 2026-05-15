package com.esprit.messageservice.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ConversationResponseDTO {
    private Long id;
    private Long participant1UserId;
    private String participant1Name;
    private Long participant2UserId;
    private String participant2Name;
    private int messageCount;
    private int unreadCount;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
}
