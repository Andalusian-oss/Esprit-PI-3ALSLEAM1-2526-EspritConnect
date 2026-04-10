package com.esprit.foyerservice.service;

import com.esprit.foyerservice.dto.request.*;
import com.esprit.foyerservice.dto.response.*;
import com.esprit.foyerservice.entity.*;
import com.esprit.foyerservice.exception.ResourceNotFoundException;
import com.esprit.foyerservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoyerServiceImpl implements FoyerService {

    private final ResidenceRepository residenceRepository;
    private final ChambreRepository chambreRepository;
    private final ReservationRepository reservationRepository;
    private final IncidentRepository incidentRepository;

    // ─── Résidences ────────────────────────────────────────────────────────────

    @Override @Transactional
    public ResidenceResponseDTO createResidence(ResidenceRequestDTO dto) {
        Residence r = Residence.builder().nom(dto.getNom()).adresse(dto.getAdresse())
                .capaciteTotale(dto.getCapaciteTotale()).build();
        return toResidenceDTO(residenceRepository.save(r));
    }

    @Override
    public List<ResidenceResponseDTO> getAllResidences() {
        return residenceRepository.findAll().stream().map(this::toResidenceDTO).collect(Collectors.toList());
    }

    @Override
    public ResidenceResponseDTO getResidenceById(Long id) { return toResidenceDTO(findResidence(id)); }

    @Override @Transactional
    public ResidenceResponseDTO updateResidence(Long id, ResidenceRequestDTO dto) {
        Residence r = findResidence(id);
        r.setNom(dto.getNom()); r.setAdresse(dto.getAdresse()); r.setCapaciteTotale(dto.getCapaciteTotale());
        return toResidenceDTO(residenceRepository.save(r));
    }

    @Override @Transactional
    public void deleteResidence(Long id) {
        if (!residenceRepository.existsById(id)) throw new ResourceNotFoundException("Residence not found: " + id);
        residenceRepository.deleteById(id);
    }

    // ─── Chambres ──────────────────────────────────────────────────────────────

    @Override @Transactional
    public ChambreResponseDTO addChambre(ChambreRequestDTO dto) {
        Residence res = findResidence(dto.getResidenceId());
        Chambre c = Chambre.builder().residence(res).numero(dto.getNumero()).type(dto.getType()).build();
        return toChambreDTO(chambreRepository.save(c));
    }

    @Override
    public List<ChambreResponseDTO> getChambresByResidence(Long residenceId) {
        return chambreRepository.findByResidenceId(residenceId).stream().map(this::toChambreDTO).collect(Collectors.toList());
    }

    @Override
    public List<ChambreResponseDTO> getDisponibles() {
        return chambreRepository.findByStatut(Chambre.StatutChambre.DISPONIBLE).stream().map(this::toChambreDTO).collect(Collectors.toList());
    }

    @Override @Transactional
    public ChambreResponseDTO updateChambreStatut(Long id, String statut) {
        Chambre c = findChambre(id);
        c.setStatut(Chambre.StatutChambre.valueOf(statut.toUpperCase()));
        return toChambreDTO(chambreRepository.save(c));
    }

    @Override @Transactional
    public void deleteChambre(Long id) {
        if (!chambreRepository.existsById(id)) throw new ResourceNotFoundException("Chambre not found: " + id);
        chambreRepository.deleteById(id);
    }

    // ─── Réservations ──────────────────────────────────────────────────────────

    @Override @Transactional
    public ReservationResponseDTO makeReservation(ReservationRequestDTO dto, Long userId) {
        if (!dto.getDateFin().isAfter(dto.getDateDebut()))
            throw new IllegalArgumentException("End date must be strictly after start date");
        Chambre c = findChambre(dto.getChambreId());
        Reservation r = Reservation.builder().chambre(c).studentUserId(userId)
                .dateDebut(dto.getDateDebut()).dateFin(dto.getDateFin()).build();
        return toReservationDTO(reservationRepository.save(r));
    }

    @Override
    public List<ReservationResponseDTO> getMyReservations(Long userId) {
        return reservationRepository.findByStudentUserId(userId).stream().map(this::toReservationDTO).collect(Collectors.toList());
    }

    @Override
    public List<ReservationResponseDTO> getAllReservations() {
        return reservationRepository.findAll().stream().map(this::toReservationDTO).collect(Collectors.toList());
    }

    @Override @Transactional
    public ReservationResponseDTO updateReservationStatut(Long id, String statut) {
        Reservation r = findReservation(id);
        r.setStatut(Reservation.StatutReservation.valueOf(statut.toUpperCase()));
        // Sync chambre status when confirmed
        if (r.getStatut() == Reservation.StatutReservation.CONFIRMEE) {
            r.getChambre().setStatut(Chambre.StatutChambre.OCCUPEE);
            chambreRepository.save(r.getChambre());
        }
        return toReservationDTO(reservationRepository.save(r));
    }

    @Override @Transactional
    public void cancelReservation(Long id, Long userId) {
        Reservation r = findReservation(id);
        if (!r.getStudentUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        r.setStatut(Reservation.StatutReservation.ANNULEE);
        reservationRepository.save(r);
        // Free the chambre if it was OCCUPEE due to this reservation
        Chambre c = r.getChambre();
        if (c.getStatut() == Chambre.StatutChambre.OCCUPEE) {
            c.setStatut(Chambre.StatutChambre.DISPONIBLE);
            chambreRepository.save(c);
        }
    }

    // ─── Incidents ─────────────────────────────────────────────────────────────

    @Override @Transactional
    public IncidentResponseDTO reportIncident(IncidentRequestDTO dto, Long userId) {
        Chambre c = findChambre(dto.getChambreId());
        Incident i = Incident.builder().chambre(c).reporterUserId(userId)
                .description(dto.getDescription()).build();
        return toIncidentDTO(incidentRepository.save(i));
    }

    @Override
    public List<IncidentResponseDTO> getIncidentsByChambre(Long chambreId) {
        return incidentRepository.findByChambreId(chambreId).stream().map(this::toIncidentDTO).collect(Collectors.toList());
    }

    @Override
    public List<IncidentResponseDTO> getAllIncidents() {
        return incidentRepository.findAll().stream().map(this::toIncidentDTO).collect(Collectors.toList());
    }

    @Override @Transactional
    public IncidentResponseDTO updateIncidentStatut(Long id, String statut) {
        Incident i = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found: " + id));
        i.setStatut(Incident.StatutIncident.valueOf(statut.toUpperCase()));
        return toIncidentDTO(incidentRepository.save(i));
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private Residence findResidence(Long id) {
        return residenceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Residence not found: " + id));
    }
    private Chambre findChambre(Long id) {
        return chambreRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Chambre not found: " + id));
    }
    private Reservation findReservation(Long id) {
        return reservationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + id));
    }

    private ResidenceResponseDTO toResidenceDTO(Residence r) {
        return ResidenceResponseDTO.builder().id(r.getId()).nom(r.getNom()).adresse(r.getAdresse())
                .capaciteTotale(r.getCapaciteTotale()).chambreCount(r.getChambres().size()).build();
    }
    private ChambreResponseDTO toChambreDTO(Chambre c) {
        return ChambreResponseDTO.builder().id(c.getId()).residenceId(c.getResidence().getId())
                .residenceNom(c.getResidence().getNom()).numero(c.getNumero()).type(c.getType()).statut(c.getStatut()).build();
    }
    private ReservationResponseDTO toReservationDTO(Reservation r) {
        return ReservationResponseDTO.builder().id(r.getId()).chambreId(r.getChambre().getId())
                .chambreNumero(r.getChambre().getNumero()).studentUserId(r.getStudentUserId())
                .dateDebut(r.getDateDebut()).dateFin(r.getDateFin()).statut(r.getStatut()).build();
    }
    private IncidentResponseDTO toIncidentDTO(Incident i) {
        return IncidentResponseDTO.builder().id(i.getId()).chambreId(i.getChambre().getId())
                .chambreNumero(i.getChambre().getNumero()).reporterUserId(i.getReporterUserId())
                .description(i.getDescription()).statut(i.getStatut()).build();
    }
}
