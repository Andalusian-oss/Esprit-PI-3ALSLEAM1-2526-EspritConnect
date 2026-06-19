package com.esprit.eventservice.controller;

import com.esprit.eventservice.dto.request.ClubRequestDTO;
import com.esprit.eventservice.dto.response.ClubMemberResponseDTO;
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
    public ResponseEntity<List<ClubResponseDTO>> getAll(HttpServletRequest req) {
        return ResponseEntity.ok(eventService.getAllClubs(currentUserIdOrNull(req)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClubResponseDTO> getById(@PathVariable Long id, HttpServletRequest req) {
        return ResponseEntity.ok(eventService.getClubById(id, currentUserIdOrNull(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClubResponseDTO> update(@PathVariable Long id,
                                                   @Valid @RequestBody ClubRequestDTO dto,
                                                   HttpServletRequest req) {
        return ResponseEntity.ok(eventService.updateClub(id, dto, extractUserId(req), extractRole(req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest req) {
        eventService.deleteClub(id, extractUserId(req), extractRole(req));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "List approved members of a club")
    public ResponseEntity<List<ClubMemberResponseDTO>> members(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getClubMembers(id));
    }

    @GetMapping("/{id}/requests")
    @Operation(summary = "List pending join requests (club admins only)")
    public ResponseEntity<List<ClubMemberResponseDTO>> requests(@PathVariable Long id, HttpServletRequest req) {
        return ResponseEntity.ok(eventService.getClubJoinRequests(id, extractUserId(req)));
    }

    @PostMapping("/{id}/requests/{userId}/approve")
    @Operation(summary = "Approve a join request (club admins only)")
    public ResponseEntity<Void> approveRequest(@PathVariable Long id, @PathVariable Long userId, HttpServletRequest req) {
        eventService.approveJoinRequest(id, userId, extractUserId(req));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/requests/{userId}")
    @Operation(summary = "Reject a join request (club admins only)")
    public ResponseEntity<Void> rejectRequest(@PathVariable Long id, @PathVariable Long userId, HttpServletRequest req) {
        eventService.rejectJoinRequest(id, userId, extractUserId(req));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "Request to join a club (requires admin approval)")
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

    private String extractRole(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.extractRole(auth.substring(7));
        return null;
    }

    private Long currentUserIdOrNull(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            try { return jwtUtil.extractUserId(auth.substring(7)); } catch (Exception ignored) {}
        }
        return null;
    }
}
