package com.esprit.foyerservice.dto.response;

import com.esprit.foyerservice.entity.Incident.StatutIncident;
import lombok.Builder; import lombok.Data;

@Data @Builder
public class IncidentResponseDTO {
    private Long id; private Long chambreId; private String chambreNumero;
    private Long reporterUserId; private String description; private StatutIncident statut;
}
