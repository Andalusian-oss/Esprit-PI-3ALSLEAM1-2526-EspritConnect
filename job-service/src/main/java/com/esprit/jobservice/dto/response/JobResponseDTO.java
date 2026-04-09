package com.esprit.jobservice.dto.response;

import com.esprit.jobservice.entity.Job.JobType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JobResponseDTO {
    private Long id;
    private String titre;
    private String entreprise;
    private String description;
    private JobType type;
    private String lieu;
    private Long posterUserId;
    private int applicationCount;
}
