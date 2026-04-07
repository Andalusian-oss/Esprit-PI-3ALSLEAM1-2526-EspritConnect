package com.esprit.eventservice.controller;

import com.esprit.eventservice.dto.request.EventRequestDTO;
import com.esprit.eventservice.dto.response.EventResponseDTO;
import com.esprit.eventservice.security.JwtUtil;
import com.esprit.eventservice.service.EventService;
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
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name = "Events")
@SecurityRequirement(name = "bearerAuth")
public class EventController {

    private final EventService eventService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<EventResponseDTO> create(@Valid @RequestBody EventRequestDTO dto,
                                                    HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.createEvent(dto, extractUserId(req)));
    }

    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> getAll() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<EventResponseDTO>> getByClub(@PathVariable Long clubId) {
        return ResponseEntity.ok(eventService.getEventsByClub(clubId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponseDTO> update(@PathVariable Long id,
                                                    @Valid @RequestBody EventRequestDTO dto,
                                                    HttpServletRequest req) {
        return ResponseEntity.ok(eventService.updateEvent(id, dto, extractUserId(req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest req) {
        eventService.deleteEvent(id, extractUserId(req));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<Void> register(@PathVariable Long id, HttpServletRequest req) {
        eventService.registerForEvent(id, extractUserId(req));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/unregister")
    public ResponseEntity<Void> unregister(@PathVariable Long id, HttpServletRequest req) {
        eventService.unregisterFromEvent(id, extractUserId(req));
        return ResponseEntity.noContent().build();
    }

    private Long extractUserId(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.extractUserId(auth.substring(7));
        throw new IllegalArgumentException("Missing Authorization header");
    }
}
