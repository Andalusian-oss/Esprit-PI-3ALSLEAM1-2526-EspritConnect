package com.esprit.jobservice.controller;

import com.esprit.jobservice.entity.Application;
import com.esprit.jobservice.entity.Job;
import com.esprit.jobservice.repository.ApplicationRepository;
import com.esprit.jobservice.repository.JobRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Live, database-backed job &amp; recruitment statistics for the admin dashboard.
 */
@RestController
@RequestMapping("/api/jobs/stats")
@RequiredArgsConstructor
@Tag(name = "Stats", description = "Job analytics")
@SecurityRequirement(name = "bearerAuth")
public class StatsController {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    @GetMapping
    @Operation(summary = "Job statistics for the analytics dashboard")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Job> jobs = jobRepository.findAll();
        List<Application> applications = applicationRepository.findAll();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalJobs", jobs.size());
        res.put("totalApplications", applications.size());

        // Acceptance rate (%) over all applications.
        long accepted = applications.stream()
                .filter(a -> a.getStatut() == Application.ApplicationStatus.ACCEPTED)
                .count();
        double acceptanceRate = applications.isEmpty() ? 0.0 : (accepted * 100.0) / applications.size();
        res.put("acceptanceRate", Math.round(acceptanceRate * 10.0) / 10.0);

        // Average match score across applications that have one.
        double avgMatch = applications.stream()
                .filter(a -> a.getMatchScore() != null)
                .mapToInt(Application::getMatchScore)
                .average()
                .orElse(0.0);
        res.put("avgMatchScore", Math.round(avgMatch * 10.0) / 10.0);

        // Jobs by contract type.
        Map<String, Long> byType = new LinkedHashMap<>();
        for (Job.JobType t : Job.JobType.values()) byType.put(t.name(), 0L);
        jobs.forEach(j -> {
            if (j.getType() != null) byType.merge(j.getType().name(), 1L, Long::sum);
        });
        res.put("byType", byType);

        // Top jobs by application count.
        List<Map<String, Object>> topJobs = jobs.stream()
                .sorted(Comparator.comparingInt((Job j) -> j.getApplications() == null ? 0 : j.getApplications().size()).reversed())
                .limit(5)
                .map(j -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("titre", j.getTitre());
                    m.put("entreprise", j.getEntreprise());
                    m.put("applications", j.getApplications() == null ? 0 : j.getApplications().size());
                    return m;
                })
                .toList();
        res.put("topJobs", topJobs);

        return ResponseEntity.ok(res);
    }
}
