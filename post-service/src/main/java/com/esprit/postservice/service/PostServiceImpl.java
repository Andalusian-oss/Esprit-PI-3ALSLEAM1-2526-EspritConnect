package com.esprit.postservice.service;

import com.esprit.postservice.dto.request.CommentRequestDTO;
import com.esprit.postservice.dto.request.PostRequestDTO;
import com.esprit.postservice.dto.response.CommentResponseDTO;
import com.esprit.postservice.dto.response.PostResponseDTO;
import com.esprit.postservice.entity.Comment;
import com.esprit.postservice.entity.Like;
import com.esprit.postservice.entity.Photo;
import com.esprit.postservice.entity.Post;
import com.esprit.postservice.exception.ResourceNotFoundException;
import com.esprit.postservice.repository.CommentRepository;
import com.esprit.postservice.repository.LikeRepository;
import com.esprit.postservice.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;

    @Override
    @Transactional
    public PostResponseDTO createPost(PostRequestDTO dto, Long userId) {
        Post post = Post.builder()
                .contenu(dto.getContenu())
                .userId(userId)
                .build();

        if (dto.getPhotoUrls() != null) {
            dto.getPhotoUrls().forEach(url -> {
                Photo photo = Photo.builder().post(post).url(url).build();
                post.getPhotos().add(photo);
            });
        }

        return toDTO(postRepository.save(post));
    }

    @Override
    public List<PostResponseDTO> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<PostResponseDTO> getPostsByUser(Long userId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public PostResponseDTO getPostById(Long id) {
        return toDTO(findPost(id));
    }

    @Override
    @Transactional
    public PostResponseDTO updatePost(Long id, PostRequestDTO dto, Long userId) {
        Post post = findPost(id);
        if (!post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to edit this post");
        }
        post.setContenu(dto.getContenu());
        return toDTO(postRepository.save(post));
    }

    @Override
    @Transactional
    public void deletePost(Long id, Long userId) {
        Post post = findPost(id);
        if (!post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to delete this post");
        }
        postRepository.delete(post);
    }

    @Override
    @Transactional
    public CommentResponseDTO addComment(Long postId, CommentRequestDTO dto, Long userId) {
        Post post = findPost(postId);
        Comment comment = Comment.builder()
                .post(post)
                .userId(userId)
                .texte(dto.getTexte())
                .build();
        return toCommentDTO(commentRepository.save(comment));
    }

    @Override
    public List<CommentResponseDTO> getCommentsByPost(Long postId) {
        findPost(postId);
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId).stream()
                .map(this::toCommentDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to delete this comment");
        }
        commentRepository.delete(comment);
    }

    @Override
    @Transactional
    public void toggleLike(Long postId, Long userId) {
        Optional<Like> existing = likeRepository.findByPostIdAndUserId(postId, userId);
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
        } else {
            Post post = findPost(postId);
            likeRepository.save(Like.builder().post(post).userId(userId).build());
        }
    }

    private Post findPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
    }

    private PostResponseDTO toDTO(Post post) {
        return PostResponseDTO.builder()
                .id(post.getId())
                .contenu(post.getContenu())
                .userId(post.getUserId())
                .createdAt(post.getCreatedAt())
                .likeCount(post.getLikes().size())
                .commentCount(post.getComments().size())
                .photoUrls(post.getPhotos().stream().map(Photo::getUrl).collect(Collectors.toList()))
                .build();
    }

    private CommentResponseDTO toCommentDTO(Comment comment) {
        return CommentResponseDTO.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .userId(comment.getUserId())
                .texte(comment.getTexte())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
