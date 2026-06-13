package com.esprit.authservice.controller;

import com.esprit.authservice.entity.Role;
import com.esprit.authservice.entity.User;
import com.esprit.authservice.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Live, database-backed statistics for the admin analytics dashboard.
 * Everything is computed on request, so the numbers always reflect the
 * current state of the database (no scheduled snapshot required).
 */
@RestController
@RequestMapping("/api/auth/stats")
@RequiredArgsConstructor
@Tag(name = "Stats", description = "Platform analytics (ADMIN only)")
@SecurityRequirement(name = "bearerAuth")
public class StatsController {

    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "User statistics for the analytics dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<User> users = userRepository.findAll();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalUsers", users.size());
        res.put("onlineNow", users.stream().filter(User::isOnline).count());

        // Count per role (always return every role so the UI is stable).
        Map<String, Long> byRole = new LinkedHashMap<>();
        for (Role r : Role.values()) byRole.put(r.name(), 0L);
        users.forEach(u -> {
            if (u.getRole() != null) byRole.merge(u.getRole().name(), 1L, Long::sum);
        });
        res.put("byRole", byRole);

        LocalDateTime startThisMonth = LocalDateTime.now()
                .toLocalDate().withDayOfMonth(1).atStartOfDay();
        LocalDateTime startLastMonth = startThisMonth.minusMonths(1);

        long newThisMonth = users.stream()
                .filter(u -> u.getCreatedAt() != null && !u.getCreatedAt().isBefore(startThisMonth))
                .count();
        long newLastMonth = users.stream()
                .filter(u -> u.getCreatedAt() != null
                        && !u.getCreatedAt().isBefore(startLastMonth)
                        && u.getCreatedAt().isBefore(startThisMonth))
                .count();
        res.put("newThisMonth", newThisMonth);
        res.put("newLastMonth", newLastMonth);

        // Cumulative user count at the end of each of the last 12 months.
        DateTimeFormatter monthLabel = DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH);
        List<Map<String, Object>> growth = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDateTime monthStart = startThisMonth.minusMonths(i);
            LocalDateTime monthEnd = monthStart.plusMonths(1);
            long cumulative = users.stream()
                    .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isBefore(monthEnd))
                    .count();
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("label", monthStart.format(monthLabel));
            point.put("value", cumulative);
            growth.add(point);
        }
        res.put("growthByMonth", growth);

        return ResponseEntity.ok(res);
    }
}
