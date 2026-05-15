package com.esprit.authservice.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Admin-seeded reference table that maps a school-issued espritId + CIN
 * to the expected role and person name.
 * During registration, the submitted espritId+CIN pair is looked up here
 * to verify identity and auto-assign the correct role.
 */
@Entity
@Table(name = "esprit_reference")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EspritReference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The school-assigned identifier (carte étudiant / matricule). */
    @Column(unique = true, nullable = false)
    private String espritId;

    /** National ID card number associated with this espritId. */
    @Column(nullable = false)
    private String cin;

    /** Role that should be auto-assigned when this espritId+CIN pair registers. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role expectedRole;

    private String nom;
    private String prenom;
}
