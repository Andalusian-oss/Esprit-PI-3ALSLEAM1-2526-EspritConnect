package com.esprit.jobservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "applications",
       uniqueConstraints = @UniqueConstraint(columnNames = {"job_id", "applicant_user_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(nullable = false)
    private Long applicantUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApplicationStatus statut = ApplicationStatus.PENDING;

    private String cvUrl;

    private Integer matchScore;

    public enum ApplicationStatus { PENDING, ACCEPTED, REJECTED }
}
