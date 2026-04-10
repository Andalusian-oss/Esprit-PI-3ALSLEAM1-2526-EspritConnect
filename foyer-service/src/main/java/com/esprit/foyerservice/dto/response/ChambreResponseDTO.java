package com.esprit.foyerservice.dto.response;

import com.esprit.foyerservice.entity.Chambre.TypeChambre;
import com.esprit.foyerservice.entity.Chambre.StatutChambre;
import lombok.Builder; import lombok.Data;

@Data @Builder
public class ChambreResponseDTO {
    private Long id; private Long residenceId; private String residenceNom;
    private String numero; private TypeChambre type; private StatutChambre statut;
}
