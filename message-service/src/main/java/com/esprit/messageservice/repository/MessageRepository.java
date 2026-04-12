package com.esprit.messageservice.repository;

import com.esprit.messageservice.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    long countByConversationIdAndLuFalseAndSenderUserIdNot(Long conversationId, Long userId);

    @Modifying
    @Query("UPDATE Message m SET m.lu = true WHERE m.conversation.id = :convId AND m.senderUserId <> :userId AND m.lu = false")
    void markAllAsRead(@Param("convId") Long conversationId, @Param("userId") Long userId);
}
