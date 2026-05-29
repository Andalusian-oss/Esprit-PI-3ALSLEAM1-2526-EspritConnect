package com.esprit.messageservice.service;

import com.esprit.messageservice.dto.request.MessageRequestDTO;
import com.esprit.messageservice.dto.response.*;
import java.util.List;

public interface MessageService {
    MessageResponseDTO sendMessage(MessageRequestDTO dto, Long senderId);
    List<ConversationResponseDTO> getMyConversations(Long userId);
    List<MessageResponseDTO> getMessages(Long conversationId, Long userId);
    void markAsRead(Long conversationId, Long userId);
    void deleteMessage(Long messageId, Long userId);
    MessageResponseDTO editMessage(Long messageId, String contenu, Long userId);
    void deleteConversation(Long conversationId, Long userId);

    List<NotificationResponseDTO> getMyNotifications(Long userId);
    void markNotificationRead(Long notificationId, Long userId);
    long countUnreadNotifications(Long userId);
}
