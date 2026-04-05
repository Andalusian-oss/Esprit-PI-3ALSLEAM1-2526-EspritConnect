package com.esprit.postservice.controller;

import com.esprit.postservice.dto.request.CommentRequestDTO;
import com.esprit.postservice.dto.request.PostRequestDTO;
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
    @Operation(summary = "Create a new post")
    public ResponseEntity<PostResponseDTO> create(@Valid @RequestBody PostRequestDTO dto,
                                                  HttpServletRequest request) {
        Long userId = extractUserId(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.createPost(dto, userId));
    }

    @GetMapping
    @Operation(summary = "Get all posts (feed)")
    public ResponseEntity<List<PostResponseDTO>> getAll() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get posts by user")
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
    @Operation(summary = "Delete a post (cascades to comments, likes, photos)")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = extractUserId(request);
        postService.deletePost(id, userId);
        return ResponseEntity.noContent().build();
    }

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

    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return jwtUtil.extractUserId(authHeader.substring(7));
        }
        throw new IllegalArgumentException("Missing or invalid Authorization header");
    }
}
