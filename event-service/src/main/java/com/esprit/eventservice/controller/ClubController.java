package com.esprit.eventservice.controller;

import com.esprit.eventservice.dto.request.ClubRequestDTO;
import com.esprit.eventservice.dto.response.ClubResponseDTO;
import com.esprit.eventservice.security.JwtUtil;
import com.esprit.eventservice.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/clubs")
@RequiredArgsConstructor
@Tag(name = "Clubs")
@SecurityRequirement(name = "bearerAuth")
public class ClubController {

    private final EventService eventService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<ClubResponseDTO> create(@Valid @RequestBody ClubRequestDTO dto,
                                                   HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.createClub(dto, extractUserId(req)));
    }

    @GetMapping
    public ResponseEntity<List<ClubResponseDTO>> getAll() {
        return ResponseEntity.ok(eventService.getAllClubs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClubResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getClubById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClubResponseDTO> update(@PathVariable Long id,
                                                   @Valid @RequestBody ClubRequestDTO dto,
                                                   HttpServletRequest req) {
        return ResponseEntity.ok(eventService.updateClub(id, dto, extractUserId(req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest req) {
        eventService.deleteClub(id, extractUserId(req));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "Join a club")
    public ResponseEntity<Void> join(@PathVariable Long id, HttpServletRequest req) {
        eventService.joinClub(id, extractUserId(req));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/leave")
    @Operation(summary = "Leave a club")
    public ResponseEntity<Void> leave(@PathVariable Long id, HttpServletRequest req) {
        eventService.leaveClub(id, extractUserId(req));
        return ResponseEntity.noContent().build();
    }

    private Long extractUserId(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.extractUserId(auth.substring(7));
        throw new IllegalArgumentException("Missing Authorization header");
    }
}
