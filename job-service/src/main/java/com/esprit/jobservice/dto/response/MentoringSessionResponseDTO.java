package com.esprit.jobservice.dto.response;

import com.esprit.jobservice.entity.MentoringSession.SessionStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class MentoringSessionResponseDTO {
    private Long id;
    private Long mentoringId;
    private LocalDateTime date;
    private Integer dureeMinutes;
    private SessionStatus statut;
}
