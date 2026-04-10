package com.esprit.foyerservice.service;

import com.esprit.foyerservice.dto.request.*;
import com.esprit.foyerservice.dto.response.*;
import java.util.List;

public interface FoyerService {
    // Résidences
    ResidenceResponseDTO createResidence(ResidenceRequestDTO dto);
    List<ResidenceResponseDTO> getAllResidences();
    ResidenceResponseDTO getResidenceById(Long id);
    ResidenceResponseDTO updateResidence(Long id, ResidenceRequestDTO dto);
    void deleteResidence(Long id);

    // Chambres
    ChambreResponseDTO addChambre(ChambreRequestDTO dto);
    List<ChambreResponseDTO> getChambresByResidence(Long residenceId);
    List<ChambreResponseDTO> getDisponibles();
    ChambreResponseDTO updateChambreStatut(Long id, String statut);
    void deleteChambre(Long id);

    // Réservations
    ReservationResponseDTO makeReservation(ReservationRequestDTO dto, Long userId);
    List<ReservationResponseDTO> getMyReservations(Long userId);
    List<ReservationResponseDTO> getAllReservations();
    ReservationResponseDTO updateReservationStatut(Long id, String statut);
    void cancelReservation(Long id, Long userId);

    // Incidents
    IncidentResponseDTO reportIncident(IncidentRequestDTO dto, Long userId);
    List<IncidentResponseDTO> getIncidentsByChambre(Long chambreId);
    List<IncidentResponseDTO> getAllIncidents();
    IncidentResponseDTO updateIncidentStatut(Long id, String statut);
}
