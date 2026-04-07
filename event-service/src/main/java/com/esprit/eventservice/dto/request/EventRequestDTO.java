package com.esprit.eventservice.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventRequestDTO {
    @NotBlank(message = "Event title is required")
    private String titre;
    private String description;

    @NotNull(message = "Event date is required")
    @Future(message = "Event date must be in the future")
    private LocalDateTime date;

    private String lieu;
    private Long clubId;
}
