package com.esprit.eventservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "club_memberships",
       uniqueConstraints = @UniqueConstraint(columnNames = {"club_id", "userId"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClubMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole role;

    public enum MemberRole { MEMBER, ADMIN }
}
