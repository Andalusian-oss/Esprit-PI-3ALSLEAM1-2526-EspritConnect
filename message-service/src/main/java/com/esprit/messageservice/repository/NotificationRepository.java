package com.esprit.messageservice.repository;

import com.esprit.messageservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long userId);
    long countByRecipientUserIdAndLuFalse(Long userId);
}
