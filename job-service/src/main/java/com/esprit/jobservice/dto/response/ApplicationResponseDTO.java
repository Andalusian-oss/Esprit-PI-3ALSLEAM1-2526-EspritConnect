package com.esprit.jobservice.dto.response;

import com.esprit.jobservice.entity.Application.ApplicationStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApplicationResponseDTO {
    private Long id;
    private Long jobId;
    private String jobTitre;
    private Long applicantUserId;
    private ApplicationStatus statut;
    private String cvUrl;
    private Integer matchScore;
}
