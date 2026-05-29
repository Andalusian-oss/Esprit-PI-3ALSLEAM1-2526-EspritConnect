package com.esprit.authservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String promo;

    private String avatarUrl;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /** School-issued identifier (carte étudiant / matricule RH). Unique when not null. */
    @Column(unique = true)
    private String espritId;

    /** National ID card number. */
    private String cin;

    /** Timestamp of last successful login. */
    private LocalDateTime lastLoginAt;

    /** Real-time online presence flag. */
    @Column(nullable = false)
    @Builder.Default
    private boolean online = false;

    /**
     * Approval flag. Always true except for COMPANY accounts which require admin approval.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean approved = true;

    /**
     * Email verification flag. Set to false on registration; becomes true after the user
     * clicks the verification link. Seed/admin accounts start as verified.
     */
    @Column(nullable = false, columnDefinition = "BOOLEAN NOT NULL DEFAULT TRUE")
    @Builder.Default
    private boolean emailVerified = true;

    /** Academic speciality (e.g. "Informatique", "Finance"). */
    private String specialite;

    /** Academic track / curriculum (e.g. "GL", "DS", "BI"). */
    private String parcours;
}
