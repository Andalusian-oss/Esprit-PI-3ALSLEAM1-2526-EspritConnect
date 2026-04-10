package com.esprit.foyerservice.dto.response;

import lombok.Builder; import lombok.Data;

@Data @Builder
public class ResidenceResponseDTO {
    private Long id; private String nom; private String adresse;
    private Integer capaciteTotale; private int chambreCount;
}
