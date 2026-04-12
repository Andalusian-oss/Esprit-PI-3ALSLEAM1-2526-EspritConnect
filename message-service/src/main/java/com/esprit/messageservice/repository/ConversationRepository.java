package com.esprit.messageservice.repository;

import com.esprit.messageservice.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByParticipant1UserIdAndParticipant2UserId(Long p1, Long p2);
    List<Conversation> findByParticipant1UserIdOrParticipant2UserId(Long p1, Long p2);
}
