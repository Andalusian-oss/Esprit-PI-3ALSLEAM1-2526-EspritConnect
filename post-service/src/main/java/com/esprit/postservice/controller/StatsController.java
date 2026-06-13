package com.esprit.postservice.controller;

import com.esprit.postservice.entity.Post;
import com.esprit.postservice.entity.PostStatus;
import com.esprit.postservice.repository.CommentRepository;
import com.esprit.postservice.repository.LikeRepository;
import com.esprit.postservice.repository.PostRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Live, database-backed post statistics for the admin analytics dashboard.
 */
@RestController
@RequestMapping("/api/posts/stats")
@RequiredArgsConstructor
@Tag(name = "Stats", description = "Post analytics")
@SecurityRequirement(name = "bearerAuth")
public class StatsController {

    private static final int HEATMAP_DAYS = 35;

    private final PostRepository postRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    @GetMapping
    @Operation(summary = "Post statistics for the analytics dashboard")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Post> approved = postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.APPROVED);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalPosts", approved.size());
        res.put("totalLikes", likeRepository.count());
        res.put("totalComments", commentRepository.count());

        LocalDateTime startThisMonth = LocalDateTime.now()
                .toLocalDate().withDayOfMonth(1).atStartOfDay();
        LocalDateTime startLastMonth = startThisMonth.minusMonths(1);
        res.put("newThisMonth", approved.stream()
                .filter(p -> p.getCreatedAt() != null && !p.getCreatedAt().isBefore(startThisMonth))
                .count());
        res.put("newLastMonth", approved.stream()
                .filter(p -> p.getCreatedAt() != null
                        && !p.getCreatedAt().isBefore(startLastMonth)
                        && p.getCreatedAt().isBefore(startThisMonth))
                .count());

        // Top posts by like count.
        List<Map<String, Object>> topPosts = approved.stream()
                .sorted(Comparator.comparingInt((Post p) -> p.getLikes() == null ? 0 : p.getLikes().size()).reversed())
                .limit(5)
                .map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("title", truncate(p.getContenu()));
                    m.put("userName", p.getUserName());
                    m.put("likes", p.getLikes() == null ? 0 : p.getLikes().size());
                    return m;
                })
                .toList();
        res.put("topPosts", topPosts);

        // Posts created per day over the last HEATMAP_DAYS days.
        LocalDate today = LocalDate.now();
        Map<LocalDate, Long> perDay = new LinkedHashMap<>();
        for (int i = HEATMAP_DAYS - 1; i >= 0; i--) perDay.put(today.minusDays(i), 0L);
        for (Post p : approved) {
            if (p.getCreatedAt() == null) continue;
            LocalDate d = p.getCreatedAt().toLocalDate();
            if (perDay.containsKey(d)) perDay.merge(d, 1L, Long::sum);
        }
        List<Map<String, Object>> activity = new ArrayList<>();
        perDay.forEach((date, count) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", date.toString());
            m.put("count", count);
            activity.add(m);
        });
        res.put("activityByDay", activity);

        return ResponseEntity.ok(res);
    }

    private String truncate(String text) {
        if (text == null) return "";
        String trimmed = text.trim().replaceAll("\\s+", " ");
        return trimmed.length() > 70 ? trimmed.substring(0, 70) + "…" : trimmed;
    }
}
