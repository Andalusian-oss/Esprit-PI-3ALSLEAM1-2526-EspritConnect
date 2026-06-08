package com.esprit.eventservice.dto.response;

import com.esprit.eventservice.entity.Event.EventCategory;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EventResponseDTO {
    private Long id;
    private String titre;
    private String description;
    private LocalDateTime date;
    private String lieu;
    private Long clubId;
    private String clubNom;
    private Long creatorUserId;
    private int registrationCount;
    private Integer attendeeLimit;
    private Integer remainingSpots;
    private EventCategory categorie;
}
