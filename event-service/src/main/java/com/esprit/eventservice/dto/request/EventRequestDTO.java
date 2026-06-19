package com.esprit.eventservice.dto.request;

import com.esprit.eventservice.entity.Event.EventCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventRequestDTO {
    @NotBlank(message = "Event title is required")
    private String titre;
    private String description;

    // Future-date constraint is enforced only on creation (see EventServiceImpl.createEvent),
    // so existing/past events can still be edited.
    @NotNull(message = "Event date is required")
    private LocalDateTime date;

    private String lieu;
    private Long clubId;
    private EventCategory categorie;

    @Min(value = 1, message = "Attendee limit must be at least 1")
    private Integer attendeeLimit;
}
