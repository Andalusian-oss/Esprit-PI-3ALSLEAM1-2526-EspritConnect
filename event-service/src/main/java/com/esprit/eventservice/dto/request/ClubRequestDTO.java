package com.esprit.eventservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClubRequestDTO {
    @NotBlank(message = "Club name is required")
    private String nom;
    private String description;
    private String logoUrl;
}
