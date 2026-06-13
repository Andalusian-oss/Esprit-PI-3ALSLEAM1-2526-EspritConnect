package com.esprit.resourceservice.controller;

import com.esprit.resourceservice.entity.Resource;
import com.esprit.resourceservice.repository.ResourceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Live, database-backed resource statistics for the admin analytics dashboard.
 */
@RestController
@RequestMapping("/api/resources/stats")
@RequiredArgsConstructor
@Tag(name = "Stats", description = "Resource analytics")
@SecurityRequirement(name = "bearerAuth")
public class StatsController {

    private final ResourceRepository resourceRepository;

    @GetMapping
    @Operation(summary = "Resource statistics for the analytics dashboard")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Resource> resources = resourceRepository.findAll();

        long totalDownloads = resources.stream().mapToLong(Resource::getDownloadCount).sum();
        long totalViews = resources.stream().mapToLong(Resource::getViewCount).sum();
        long totalLikes = resources.stream().mapToLong(Resource::getLikeCount).sum();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("total", resources.size());
        res.put("totalDownloads", totalDownloads);
        res.put("totalViews", totalViews);
        res.put("totalLikes", totalLikes);
        // Share of views that converted into a download.
        res.put("downloadRate", totalViews == 0 ? 0 : Math.round((totalDownloads * 100.0) / totalViews));

        // Resources by category.
        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (Resource.ResourceCategory c : Resource.ResourceCategory.values()) byCategory.put(c.name(), 0L);
        resources.forEach(r -> {
            if (r.getCategorie() != null) byCategory.merge(r.getCategorie().name(), 1L, Long::sum);
        });
        res.put("byCategory", byCategory);

        // Most populated category.
        String topCategory = byCategory.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("—");
        res.put("topCategory", topCategory);

        return ResponseEntity.ok(res);
    }
}
