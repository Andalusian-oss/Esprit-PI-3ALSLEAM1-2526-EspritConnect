package com.esprit.authservice.dto.response;

import com.esprit.authservice.entity.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponseDTO {
    private Long id;
    private String email;
    private String prenom;
    private String nom;
    private Role role;
    private String promo;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private String espritId;
    private String cin;
    private LocalDateTime lastLoginAt;
    private boolean online;
    private boolean approved;
    private String specialite;
    private String parcours;
}
