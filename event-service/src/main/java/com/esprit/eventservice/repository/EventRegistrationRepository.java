package com.esprit.eventservice.repository;

import com.esprit.eventservice.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    boolean existsByEventIdAndUserId(Long eventId, Long userId);
    Optional<EventRegistration> findByEventIdAndUserId(Long eventId, Long userId);
    List<EventRegistration> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    long countByEventId(Long eventId);
    void deleteByEventIdAndUserId(Long eventId, Long userId);
}
