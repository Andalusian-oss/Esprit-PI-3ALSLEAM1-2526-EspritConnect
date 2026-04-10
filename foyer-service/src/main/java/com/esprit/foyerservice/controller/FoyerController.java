package com.esprit.foyerservice.controller;

import com.esprit.foyerservice.dto.request.*;
import com.esprit.foyerservice.dto.response.*;
import com.esprit.foyerservice.security.JwtUtil;
import com.esprit.foyerservice.service.FoyerService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foyer")
@RequiredArgsConstructor
@Tag(name = "Foyer — Residence, Chambre, Réservation, Incident")
@SecurityRequirement(name = "bearerAuth")
public class FoyerController {

    private final FoyerService foyerService;
    private final JwtUtil jwtUtil;

    // ─── Résidences ────────────────────────────────────────────────────────────

    @PostMapping("/residences")
    public ResponseEntity<ResidenceResponseDTO> createResidence(@Valid @RequestBody ResidenceRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(foyerService.createResidence(dto));
    }
    @GetMapping("/residences")
    public ResponseEntity<List<ResidenceResponseDTO>> getAllResidences() {
        return ResponseEntity.ok(foyerService.getAllResidences());
    }
    @GetMapping("/residences/{id}")
    public ResponseEntity<ResidenceResponseDTO> getResidence(@PathVariable Long id) {
        return ResponseEntity.ok(foyerService.getResidenceById(id));
    }
    @PutMapping("/residences/{id}")
    public ResponseEntity<ResidenceResponseDTO> updateResidence(@PathVariable Long id, @Valid @RequestBody ResidenceRequestDTO dto) {
        return ResponseEntity.ok(foyerService.updateResidence(id, dto));
    }
    @DeleteMapping("/residences/{id}")
    public ResponseEntity<Void> deleteResidence(@PathVariable Long id) {
        foyerService.deleteResidence(id); return ResponseEntity.noContent().build();
    }

    // ─── Chambres ──────────────────────────────────────────────────────────────

    @PostMapping("/chambres")
    public ResponseEntity<ChambreResponseDTO> addChambre(@Valid @RequestBody ChambreRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(foyerService.addChambre(dto));
    }
    @GetMapping("/chambres")
    public ResponseEntity<List<ChambreResponseDTO>> getDisponibles() {
        return ResponseEntity.ok(foyerService.getDisponibles());
    }
    @GetMapping("/residences/{residenceId}/chambres")
    public ResponseEntity<List<ChambreResponseDTO>> getChambresByResidence(@PathVariable Long residenceId) {
        return ResponseEntity.ok(foyerService.getChambresByResidence(residenceId));
    }
    @PatchMapping("/chambres/{id}/statut")
    public ResponseEntity<ChambreResponseDTO> updateChambreStatut(@PathVariable Long id, @RequestParam String statut) {
        return ResponseEntity.ok(foyerService.updateChambreStatut(id, statut));
    }
    @DeleteMapping("/chambres/{id}")
    public ResponseEntity<Void> deleteChambre(@PathVariable Long id) {
        foyerService.deleteChambre(id); return ResponseEntity.noContent().build();
    }

    // ─── Réservations ──────────────────────────────────────────────────────────

    @PostMapping("/reservations")
    public ResponseEntity<ReservationResponseDTO> reserve(@Valid @RequestBody ReservationRequestDTO dto, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(foyerService.makeReservation(dto, extractUserId(req)));
    }
    @GetMapping("/reservations/my")
    public ResponseEntity<List<ReservationResponseDTO>> myReservations(HttpServletRequest req) {
        return ResponseEntity.ok(foyerService.getMyReservations(extractUserId(req)));
    }
    @GetMapping("/reservations")
    public ResponseEntity<List<ReservationResponseDTO>> allReservations() {
        return ResponseEntity.ok(foyerService.getAllReservations());
    }
    @PatchMapping("/reservations/{id}/statut")
    public ResponseEntity<ReservationResponseDTO> updateReservationStatut(@PathVariable Long id, @RequestParam String statut) {
        return ResponseEntity.ok(foyerService.updateReservationStatut(id, statut));
    }
    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id, HttpServletRequest req) {
        foyerService.cancelReservation(id, extractUserId(req)); return ResponseEntity.noContent().build();
    }

    // ─── Incidents ─────────────────────────────────────────────────────────────

    @PostMapping("/incidents")
    public ResponseEntity<IncidentResponseDTO> reportIncident(@Valid @RequestBody IncidentRequestDTO dto, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(foyerService.reportIncident(dto, extractUserId(req)));
    }
    @GetMapping("/incidents")
    public ResponseEntity<List<IncidentResponseDTO>> allIncidents() {
        return ResponseEntity.ok(foyerService.getAllIncidents());
    }
    @GetMapping("/chambres/{chambreId}/incidents")
    public ResponseEntity<List<IncidentResponseDTO>> getIncidentsByChambre(@PathVariable Long chambreId) {
        return ResponseEntity.ok(foyerService.getIncidentsByChambre(chambreId));
    }
    @PatchMapping("/incidents/{id}/statut")
    public ResponseEntity<IncidentResponseDTO> updateIncidentStatut(@PathVariable Long id, @RequestParam String statut) {
        return ResponseEntity.ok(foyerService.updateIncidentStatut(id, statut));
    }

    private Long extractUserId(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.extractUserId(auth.substring(7));
        throw new IllegalArgumentException("Missing Authorization header");
    }
}
