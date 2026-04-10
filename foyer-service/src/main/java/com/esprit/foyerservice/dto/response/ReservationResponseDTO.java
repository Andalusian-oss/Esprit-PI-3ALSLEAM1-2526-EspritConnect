package com.esprit.foyerservice.dto.response;

import com.esprit.foyerservice.entity.Reservation.StatutReservation;
import lombok.Builder; import lombok.Data;
import java.time.LocalDate;

@Data @Builder
public class ReservationResponseDTO {
    private Long id; private Long chambreId; private String chambreNumero;
    private Long studentUserId; private LocalDate dateDebut; private LocalDate dateFin;
    private StatutReservation statut;
}
