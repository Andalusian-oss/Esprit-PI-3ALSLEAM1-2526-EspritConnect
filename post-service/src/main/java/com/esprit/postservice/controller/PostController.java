package com.esprit.postservice.controller;

import com.esprit.postservice.dto.request.CommentRequestDTO;
import com.esprit.postservice.dto.request.PostRequestDTO;
import com.esprit.postservice.dto.request.ReactionRequestDTO;
import com.esprit.postservice.dto.response.CommentResponseDTO;
import com.esprit.postservice.dto.response.PostResponseDTO;
import com.esprit.postservice.security.JwtUtil;
import com.esprit.postservice.service.PostService;
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
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Posts", description = "Post CRUD + comments + likes")
@SecurityRequirement(name = "bearerAuth")
public class PostController {

    private final PostService postService;
    private final JwtUtil jwtUtil;

    @PostMapping
    @Operation(summary = "Create a new post (starts as PENDING, awaiting admin approval)")
    public ResponseEntity<PostResponseDTO> create(@Valid @RequestBody PostRequestDTO dto,
                                                  HttpServletRequest request) {
        Long userId = extractUserId(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.createPost(dto, userId));
    }

    @GetMapping
    @Operation(summary = "Get approved posts (feed), paginated with ?page=0&size=20")
    public ResponseEntity<List<PostResponseDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(postService.getAllPosts(page, size));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all posts by user (all statuses)")
    public ResponseEntity<List<PostResponseDTO>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(postService.getPostsByUser(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get post by ID")
    public ResponseEntity<PostResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a post")
    public ResponseEntity<PostResponseDTO> update(@PathVariable Long id,
                                                  @Valid @RequestBody PostRequestDTO dto,
                                                  HttpServletRequest request) {
        Long userId = extractUserId(request);
        return ResponseEntity.ok(postService.updatePost(id, dto, userId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a post (owner or admin)")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = extractUserId(request);
        String role = extractRole(request);
        postService.deletePost(id, userId, role);
        return ResponseEntity.noContent().build();
    }

    // ── Admin moderation endpoints ──────────────────────────────────────

    @GetMapping("/admin/pending")
    @Operation(summary = "Admin: get all pending posts")
    public ResponseEntity<List<PostResponseDTO>> getPending(HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(postService.getPendingPosts());
    }

    @PutMapping("/admin/{id}/approve")
    @Operation(summary = "Admin: approve a post")
    public ResponseEntity<PostResponseDTO> approve(@PathVariable Long id, HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(postService.approvePost(id));
    }

    @PutMapping("/admin/{id}/reject")
    @Operation(summary = "Admin: reject a post")
    public ResponseEntity<PostResponseDTO> reject(@PathVariable Long id, HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(postService.rejectPost(id));
    }

    @DeleteMapping("/admin/{id}")
    @Operation(summary = "Admin: delete any post")
    public ResponseEntity<Void> adminDelete(@PathVariable Long id, HttpServletRequest request) {
        requireAdmin(request);
        postService.deletePost(id, null, "ADMIN");
        return ResponseEntity.noContent().build();
    }

    // ── Comments ────────────────────────────────────────────────────────

    @PostMapping("/{postId}/comments")
    @Operation(summary = "Add a comment to a post")
    public ResponseEntity<CommentResponseDTO> addComment(@PathVariable Long postId,
                                                         @Valid @RequestBody CommentRequestDTO dto,
                                                         HttpServletRequest request) {
        Long userId = extractUserId(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.addComment(postId, dto, userId));
    }

    @GetMapping("/{postId}/comments")
    @Operation(summary = "Get all comments of a post")
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.getCommentsByPost(postId));
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete a comment")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, HttpServletRequest request) {
        Long userId = extractUserId(request);
        postService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{postId}/likes")
    @Operation(summary = "Toggle like/unlike on a post")
    public ResponseEntity<Void> toggleLike(@PathVariable Long postId, HttpServletRequest request) {
        Long userId = extractUserId(request);
        postService.toggleLike(postId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{postId}/reactions")
    @Operation(summary = "Add or toggle a reaction (LIKE, WOW, APPRECIATE, GG)")
    public ResponseEntity<Void> setReaction(@PathVariable Long postId,
                                            @Valid @RequestBody ReactionRequestDTO dto,
                                            HttpServletRequest request) {
        Long userId = extractUserId(request);
        postService.setReaction(postId, userId, dto.getType());
        return ResponseEntity.ok().build();
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return jwtUtil.extractUserId(authHeader.substring(7));
        }
        throw new IllegalArgumentException("Missing or invalid Authorization header");
    }

    private String extractRole(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return jwtUtil.extractRole(authHeader.substring(7));
        }
        return null;
    }

    private void requireAdmin(HttpServletRequest request) {
        String role = extractRole(request);
        if (!"ADMIN".equals(role)) {
            throw new org.springframework.security.access.AccessDeniedException("Admin access required");
        }
    }
}
