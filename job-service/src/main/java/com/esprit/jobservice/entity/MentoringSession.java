package com.esprit.jobservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentoring_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MentoringSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentoring_id", nullable = false)
    private Mentoring mentoring;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(nullable = false)
    private Integer dureeMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SessionStatus statut = SessionStatus.PLANNED;

    public enum SessionStatus { PLANNED, LIVE, DONE, CANCELLED }
}
