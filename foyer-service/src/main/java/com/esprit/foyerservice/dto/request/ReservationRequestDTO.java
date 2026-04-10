package com.esprit.foyerservice.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ReservationRequestDTO {
    @NotNull private Long chambreId;
    @NotNull @Future private LocalDate dateDebut;
    @NotNull @Future private LocalDate dateFin;
}
