package com.esprit.eventservice.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClubResponseDTO {
    private Long id;
    private String nom;
    private String description;
    private String logoUrl;
    private Long creatorUserId;
    private int memberCount;
}
