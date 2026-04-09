package com.esprit.jobservice.dto.request;

import com.esprit.jobservice.entity.Job.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JobRequestDTO {
    @NotBlank(message = "Title is required")
    private String titre;
    @NotBlank(message = "Company is required")
    private String entreprise;
    private String description;
    @NotNull(message = "Job type is required")
    private JobType type;
    private String lieu;
}
