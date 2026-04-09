package com.esprit.jobservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mentorings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Mentoring {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long mentorUserId;

    @Column(nullable = false)
    private Long mentoreUserId;

    @Column(nullable = false)
    private String domaine;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MentoringStatus statut = MentoringStatus.ACTIVE;

    @OneToMany(mappedBy = "mentoring", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MentoringSession> sessions = new ArrayList<>();

    public enum MentoringStatus { ACTIVE, COMPLETED }
}
