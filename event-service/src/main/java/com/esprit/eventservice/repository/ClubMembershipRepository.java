package com.esprit.eventservice.repository;

import com.esprit.eventservice.entity.ClubMembership;
import com.esprit.eventservice.entity.ClubMembership.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClubMembershipRepository extends JpaRepository<ClubMembership, Long> {
    Optional<ClubMembership> findByClubIdAndUserId(Long clubId, Long userId);
    boolean existsByClubIdAndUserId(Long clubId, Long userId);
    // Admins first (role DESC: ADMIN ordinal > MEMBER), then by insertion order.
    List<ClubMembership> findAllByClubIdAndStatusOrderByRoleDescIdAsc(Long clubId, MembershipStatus status);
    List<ClubMembership> findAllByClubIdAndStatusOrderByIdAsc(Long clubId, MembershipStatus status);
    long countByClubIdAndStatus(Long clubId, MembershipStatus status);
}
