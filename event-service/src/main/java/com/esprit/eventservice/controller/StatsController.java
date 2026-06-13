package com.esprit.eventservice.controller;

import com.esprit.eventservice.entity.Event;
import com.esprit.eventservice.repository.EventRegistrationRepository;
import com.esprit.eventservice.repository.EventRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Live, database-backed event statistics for the admin analytics dashboard.
 */
@RestController
@RequestMapping("/api/events/stats")
@RequiredArgsConstructor
@Tag(name = "Stats", description = "Event analytics")
@SecurityRequirement(name = "bearerAuth")
public class StatsController {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;

    @GetMapping
    @Operation(summary = "Event statistics for the analytics dashboard")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Event> events = eventRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalEvents", events.size());
        res.put("upcoming", events.stream()
                .filter(e -> e.getDate() != null && e.getDate().isAfter(now)).count());
        res.put("completed", events.stream()
                .filter(e -> e.getDate() != null && !e.getDate().isAfter(now)).count());
        res.put("totalRegistrations", registrationRepository.count());

        // Events by category.
        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (Event.EventCategory c : Event.EventCategory.values()) byCategory.put(c.name(), 0L);
        events.forEach(e -> {
            if (e.getCategorie() != null) byCategory.merge(e.getCategorie().name(), 1L, Long::sum);
        });
        res.put("byCategory", byCategory);

        // Top events by registration count.
        List<Map<String, Object>> topEvents = events.stream()
                .sorted(Comparator.comparingInt((Event e) -> e.getRegistrations() == null ? 0 : e.getRegistrations().size()).reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("titre", e.getTitre());
                    m.put("registrations", e.getRegistrations() == null ? 0 : e.getRegistrations().size());
                    return m;
                })
                .toList();
        res.put("topEvents", topEvents);

        return ResponseEntity.ok(res);
    }
}
