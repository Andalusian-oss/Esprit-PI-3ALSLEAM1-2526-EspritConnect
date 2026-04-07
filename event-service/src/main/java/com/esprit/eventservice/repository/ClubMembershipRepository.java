package com.esprit.eventservice.repository;

import com.esprit.eventservice.entity.ClubMembership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClubMembershipRepository extends JpaRepository<ClubMembership, Long> {
    Optional<ClubMembership> findByClubIdAndUserId(Long clubId, Long userId);
    boolean existsByClubIdAndUserId(Long clubId, Long userId);
}
