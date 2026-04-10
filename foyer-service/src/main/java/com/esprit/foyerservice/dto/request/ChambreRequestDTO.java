package com.esprit.foyerservice.dto.request;

import com.esprit.foyerservice.entity.Chambre.TypeChambre;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChambreRequestDTO {
    @NotBlank(message = "Room number is required") private String numero;
    @NotNull(message = "Room type is required") private TypeChambre type;
    @NotNull(message = "Residence ID is required") private Long residenceId;
}
