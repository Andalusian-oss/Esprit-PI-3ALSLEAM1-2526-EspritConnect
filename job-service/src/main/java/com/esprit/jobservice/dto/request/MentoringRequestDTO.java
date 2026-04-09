package com.esprit.jobservice.dto.request;

import com.esprit.jobservice.entity.Mentoring.MentoringStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MentoringRequestDTO {
    @NotNull(message = "Mentor user ID is required")
    private Long mentorUserId;
    @NotBlank(message = "Domain is required")
    private String domaine;
}
