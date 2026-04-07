package com.esprit.eventservice.repository;

import com.esprit.eventservice.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    boolean existsByEventIdAndUserId(Long eventId, Long userId);
    void deleteByEventIdAndUserId(Long eventId, Long userId);
}
