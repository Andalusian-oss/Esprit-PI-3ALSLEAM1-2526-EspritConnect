package com.esprit.eventservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "club_memberships",
       uniqueConstraints = @UniqueConstraint(columnNames = {"club_id", "user_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClubMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole role;

    // SQL default 'APPROVED' so the ddl-auto ALTER backfills existing rows and the
    // data.sql seed inserts (which omit status) remain valid. New join requests set PENDING explicitly.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(20) not null default 'APPROVED'")
    @Builder.Default
    private MembershipStatus status = MembershipStatus.APPROVED;

    public enum MemberRole { MEMBER, ADMIN }
    public enum MembershipStatus { PENDING, APPROVED }
}
