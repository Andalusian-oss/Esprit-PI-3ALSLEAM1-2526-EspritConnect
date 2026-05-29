package com.esprit.jobservice.controller;

import com.esprit.jobservice.dto.request.JobRequestDTO;
import com.esprit.jobservice.dto.request.MentoringRequestDTO;
import com.esprit.jobservice.dto.request.MentoringSessionRequestDTO;
import com.esprit.jobservice.dto.response.*;
import com.esprit.jobservice.security.JwtUtil;
import com.esprit.jobservice.service.JobService;
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
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs")
@SecurityRequirement(name = "bearerAuth")
public class JobController {

    private final JobService jobService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<JobResponseDTO> create(@Valid @RequestBody JobRequestDTO dto, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.createJob(dto, extractUserId(req)));
    }
    @GetMapping
    public ResponseEntity<List<JobResponseDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(jobService.getAllJobs(page, size));
    }
    @GetMapping("/{id}")
    public ResponseEntity<JobResponseDTO> getById(@PathVariable Long id) { return ResponseEntity.ok(jobService.getJobById(id)); }
    @PutMapping("/{id}")
    public ResponseEntity<JobResponseDTO> update(@PathVariable Long id, @Valid @RequestBody JobRequestDTO dto, HttpServletRequest req) {
        return ResponseEntity.ok(jobService.updateJob(id, dto, extractUserId(req)));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest req) {
        jobService.deleteJob(id, extractUserId(req)); return ResponseEntity.noContent().build();
    }

    // Applications
    @PostMapping("/{jobId}/apply")
    public ResponseEntity<ApplicationResponseDTO> apply(
            @PathVariable Long jobId,
            @RequestBody(required = false) java.util.Map<String, String> body,
            HttpServletRequest req) {
        String cvUrl = body != null ? body.get("cvUrl") : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.apply(jobId, extractUserId(req), cvUrl));
    }

    @PatchMapping("/applications/{appId}/match-score")
    public ResponseEntity<ApplicationResponseDTO> updateMatchScore(
            @PathVariable Long appId,
            @RequestBody java.util.Map<String, Integer> body,
            HttpServletRequest req) {
        Integer score = body.get("matchScore");
        if (score == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(jobService.updateMatchScore(appId, score, extractUserId(req)));
    }

    @PatchMapping("/applications/{appId}/cv-url")
    public ResponseEntity<ApplicationResponseDTO> updateCvUrl(
            @PathVariable Long appId,
            @RequestBody java.util.Map<String, String> body,
            HttpServletRequest req) {
        String cvUrl = body.get("cvUrl");
        if (cvUrl == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(jobService.updateCvUrl(appId, cvUrl, extractUserId(req)));
    }
    @GetMapping("/my-applications")
    public ResponseEntity<List<ApplicationResponseDTO>> getMyApplications(HttpServletRequest req) {
        return ResponseEntity.ok(jobService.getApplicationsByUser(extractUserId(req)));
    }
    @GetMapping("/{jobId}/applications")
    public ResponseEntity<List<ApplicationResponseDTO>> getApplicationsByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.getApplicationsByJob(jobId));
    }
    @GetMapping("/{jobId}/ranked-applicants")
    public ResponseEntity<List<ApplicationResponseDTO>> getRankedApplicants(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.getRankedApplicants(jobId));
    }
    @PatchMapping("/applications/{appId}/status")
    public ResponseEntity<ApplicationResponseDTO> updateStatus(@PathVariable Long appId,
            @RequestParam String status, HttpServletRequest req) {
        return ResponseEntity.ok(jobService.updateApplicationStatus(appId, status, extractUserId(req)));
    }
    @DeleteMapping("/applications/{appId}")
    public ResponseEntity<Void> withdraw(@PathVariable Long appId, HttpServletRequest req) {
        jobService.withdrawApplication(appId, extractUserId(req)); return ResponseEntity.noContent().build();
    }

    // Mentoring
    @PostMapping("/mentoring")
    public ResponseEntity<MentoringResponseDTO> requestMentoring(@Valid @RequestBody MentoringRequestDTO dto, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.requestMentoring(dto, extractUserId(req)));
    }
    @GetMapping("/mentoring/as-mentor")
    public ResponseEntity<List<MentoringResponseDTO>> asMentor(HttpServletRequest req) {
        return ResponseEntity.ok(jobService.getMentoringAsMentor(extractUserId(req)));
    }
    @GetMapping("/mentoring/as-mentore")
    public ResponseEntity<List<MentoringResponseDTO>> asMentore(HttpServletRequest req) {
        return ResponseEntity.ok(jobService.getMentoringAsMentore(extractUserId(req)));
    }
    @PatchMapping("/mentoring/{id}/complete")
    public ResponseEntity<Void> completeMentoring(@PathVariable Long id, HttpServletRequest req) {
        jobService.completeMentoring(id, extractUserId(req)); return ResponseEntity.ok().build();
    }
    @PatchMapping("/mentoring/{id}/cancel")
    public ResponseEntity<Void> cancelMentoring(@PathVariable Long id, HttpServletRequest req) {
        jobService.cancelMentoring(id, extractUserId(req)); return ResponseEntity.ok().build();
    }

    // Sessions
    @PostMapping("/mentoring/{mentoringId}/sessions")
    public ResponseEntity<MentoringSessionResponseDTO> addSession(@PathVariable Long mentoringId,
            @Valid @RequestBody MentoringSessionRequestDTO dto, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.addSession(mentoringId, dto, extractUserId(req)));
    }
    @GetMapping("/mentoring/{mentoringId}/sessions")
    public ResponseEntity<List<MentoringSessionResponseDTO>> getSessions(@PathVariable Long mentoringId) {
        return ResponseEntity.ok(jobService.getSessionsByMentoring(mentoringId));
    }
    @PatchMapping("/sessions/{sessionId}/status")
    public ResponseEntity<MentoringSessionResponseDTO> updateSessionStatus(@PathVariable Long sessionId,
            @RequestParam String status, HttpServletRequest req) {
        return ResponseEntity.ok(jobService.updateSessionStatus(sessionId, status, extractUserId(req)));
    }

    private Long extractUserId(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.extractUserId(auth.substring(7));
        throw new IllegalArgumentException("Missing Authorization header");
    }
}
