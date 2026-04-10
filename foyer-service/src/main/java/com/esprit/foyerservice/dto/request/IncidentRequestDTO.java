package com.esprit.foyerservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IncidentRequestDTO {
    @NotNull private Long chambreId;
    @NotBlank(message = "Description is required") private String description;
}
