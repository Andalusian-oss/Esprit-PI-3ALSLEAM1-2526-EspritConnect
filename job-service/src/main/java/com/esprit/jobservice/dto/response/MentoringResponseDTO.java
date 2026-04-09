package com.esprit.jobservice.dto.response;

import com.esprit.jobservice.entity.Mentoring.MentoringStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MentoringResponseDTO {
    private Long id;
    private Long mentorUserId;
    private Long mentoreUserId;
    private String domaine;
    private MentoringStatus statut;
    private int sessionCount;
}
