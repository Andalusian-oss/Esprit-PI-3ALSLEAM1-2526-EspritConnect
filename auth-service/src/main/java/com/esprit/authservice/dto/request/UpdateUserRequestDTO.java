package com.esprit.authservice.dto.request;

import com.esprit.authservice.entity.Role;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateUserRequestDTO {

    @Email(message = "Email must be valid")
    private String email;

    private String prenom;

    private String nom;

    private Role role;

    private String promo;

    private String avatarUrl;

    private String specialite;

    private String parcours;
}
