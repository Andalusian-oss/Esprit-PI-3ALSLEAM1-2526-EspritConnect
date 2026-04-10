package com.esprit.foyerservice.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResidenceRequestDTO {
    @NotBlank(message = "Name is required") private String nom;
    @NotBlank(message = "Address is required") private String adresse;
    @NotNull @Min(1) private Integer capaciteTotale;
}
