package com.esprit.jobservice.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MentoringSessionRequestDTO {
    @NotNull(message = "Date is required")
    private LocalDateTime date;
    @NotNull @Min(value = 15, message = "Duration must be at least 15 minutes")
    private Integer dureeMinutes;
}
