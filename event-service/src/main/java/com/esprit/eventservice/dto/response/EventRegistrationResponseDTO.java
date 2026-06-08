package com.esprit.eventservice.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EventRegistrationResponseDTO {
    private Long id;
    private Long eventId;
    private String eventTitre;
    private LocalDateTime eventDate;
    private String eventLieu;
    private Long userId;
    private String inviteCode;
    private String qrPayload;
    private LocalDateTime createdAt;
}