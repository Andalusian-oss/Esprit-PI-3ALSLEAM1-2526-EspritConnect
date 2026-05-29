package com.esprit.postservice.service;

import com.esprit.postservice.dto.request.CommentRequestDTO;
import com.esprit.postservice.dto.request.PostRequestDTO;
import com.esprit.postservice.dto.response.CommentResponseDTO;
import com.esprit.postservice.dto.response.PostResponseDTO;

import java.util.List;

public interface PostService {
    PostResponseDTO createPost(PostRequestDTO dto, Long userId);
    List<PostResponseDTO> getAllPosts();
    List<PostResponseDTO> getAllPosts(int page, int size);
    List<PostResponseDTO> getPostsByUser(Long userId);
    PostResponseDTO getPostById(Long id);
    PostResponseDTO updatePost(Long id, PostRequestDTO dto, Long userId);
    void deletePost(Long id, Long userId, String role);

    // Admin moderation
    List<PostResponseDTO> getPendingPosts();
    PostResponseDTO approvePost(Long id);
    PostResponseDTO rejectPost(Long id);

    CommentResponseDTO addComment(Long postId, CommentRequestDTO dto, Long userId);
    List<CommentResponseDTO> getCommentsByPost(Long postId);
    void deleteComment(Long commentId, Long userId);

    void toggleLike(Long postId, Long userId);
}
