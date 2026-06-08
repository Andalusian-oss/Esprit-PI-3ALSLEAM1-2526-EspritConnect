package com.esprit.authservice.dto.request;

import com.esprit.authservice.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "First name is required")
    private String prenom;

    @NotBlank(message = "Last name is required")
    private String nom;

    @NotNull(message = "Role is required")
    private Role role;

    private String promo;
    private String avatarUrl;

    /** School-issued identifier. Required for all roles except COMPANY. */
    private String espritId;

    /** National ID card number. Required for all roles except COMPANY. */
    private String cin;

    /** Academic speciality (e.g. \"Informatique\", \"Finance\"). */
    private String specialite;

    /** Academic track / curriculum (e.g. \"GL\", \"DS\"). */
    private String parcours;
    /** URL of the uploaded verification document. Required for COMPANY accounts. */
    private String verificationDocumentUrl;}
