package com.esprit.postservice.service;

import com.esprit.postservice.dto.request.CommentRequestDTO;
import com.esprit.postservice.dto.request.PostRequestDTO;
import com.esprit.postservice.dto.response.CommentResponseDTO;
import com.esprit.postservice.dto.response.PostResponseDTO;
import com.esprit.postservice.dto.response.ReactionCountDTO;
import com.esprit.postservice.entity.Comment;
import com.esprit.postservice.entity.Like;
import com.esprit.postservice.entity.Photo;
import com.esprit.postservice.entity.Post;
import com.esprit.postservice.entity.PostStatus;
import com.esprit.postservice.entity.Reaction;
import com.esprit.postservice.entity.Reaction.ReactionType;
import com.esprit.postservice.exception.ResourceNotFoundException;
import com.esprit.postservice.repository.CommentRepository;
import com.esprit.postservice.repository.LikeRepository;
import com.esprit.postservice.repository.PostRepository;
import com.esprit.postservice.repository.ReactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final ReactionRepository reactionRepository;

    @Override
    @Transactional
    public PostResponseDTO createPost(PostRequestDTO dto, Long userId) {
        List<String> media = dto.getPhotoUrls() != null ? dto.getPhotoUrls() : Collections.emptyList();
        boolean hasText = dto.getContenu() != null && !dto.getContenu().trim().isEmpty();
        boolean hasMedia = !media.isEmpty();
        if (!hasText && !hasMedia) {
            throw new IllegalArgumentException("Post content or media is required");
        }

        boolean isShare = dto.getOriginalPostId() != null;
        Post post = Post.builder()
                .contenu(dto.getContenu() != null ? dto.getContenu().trim() : "")
                .userId(userId)
                .userName(dto.getUserName() != null ? dto.getUserName() : "")
                .originalPostId(dto.getOriginalPostId())
                .originalAuthorName(dto.getOriginalAuthorName())
                .status((Boolean.TRUE.equals(dto.getAutoApprove()) || isShare) ? PostStatus.APPROVED : PostStatus.PENDING)
                .build();

        if (hasMedia) {
            media.forEach(url -> {
                Photo photo = Photo.builder().post(post).url(url).build();
                post.getPhotos().add(photo);
            });
        }

        return toDTO(postRepository.save(post), userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponseDTO> getAllPosts() {
        return postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.APPROVED).stream()
                .map(p -> toDTO(p, null)).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponseDTO> getAllPosts(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.APPROVED, pageable)
                .stream().map(p -> toDTO(p, null)).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponseDTO> getPostsByUser(Long userId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(p -> toDTO(p, userId)).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponseDTO getPostById(Long id) {
        return toDTO(findPost(id), null);
    }

    @Override
    @Transactional
    public PostResponseDTO updatePost(Long id, PostRequestDTO dto, Long userId) {
        Post post = findPost(id);
        if (!post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to edit this post");
        }
        if (dto.getContenu() == null || dto.getContenu().trim().isEmpty()) {
            throw new IllegalArgumentException("Content is required");
        }
        post.setContenu(dto.getContenu().trim());
        return toDTO(postRepository.save(post), userId);
    }

    @Override
    @Transactional
    public void deletePost(Long id, Long userId, String role) {
        Post post = findPost(id);
        if (!"ADMIN".equals(role) && !post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to delete this post");
        }
        postRepository.delete(post);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponseDTO> getPendingPosts() {
        return postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.PENDING).stream()
                .map(p -> toDTO(p, null)).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PostResponseDTO approvePost(Long id) {
        Post post = findPost(id);
        post.setStatus(PostStatus.APPROVED);
        return toDTO(postRepository.save(post), null);
    }

    @Override
    @Transactional
    public PostResponseDTO rejectPost(Long id) {
        Post post = findPost(id);
        post.setStatus(PostStatus.REJECTED);
        return toDTO(postRepository.save(post), null);
    }

    @Override
    @Transactional
    public void setReaction(Long postId, Long userId, ReactionType type) {
        Post post = findPost(postId);
        var existing = reactionRepository.findByPostIdAndUserId(postId, userId);
        if (existing.isPresent()) {
            Reaction reaction = existing.get();
            if (reaction.getType() == type) {
                reactionRepository.delete(reaction);
            } else {
                reaction.setType(type);
                reactionRepository.save(reaction);
            }
        } else {
            Reaction reaction = Reaction.builder()
                    .post(post)
                    .userId(userId)
                    .type(type)
                    .build();
            reactionRepository.save(reaction);
        }
    }

    @Override
    @Transactional
    public CommentResponseDTO addComment(Long postId, CommentRequestDTO dto, Long userId) {
        Post post = findPost(postId);
        Comment comment = Comment.builder()
                .post(post)
                .userId(userId)
                .userName(dto.getUserName() != null ? dto.getUserName() : "")
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

    private ReactionCountDTO buildReactionCounts(Post post, Long userId) {
        long likes = reactionRepository.countByPostIdAndType(post.getId(), ReactionType.LIKE);
        long wows = reactionRepository.countByPostIdAndType(post.getId(), ReactionType.WOW);
        long appreciates = reactionRepository.countByPostIdAndType(post.getId(), ReactionType.APPRECIATE);
        long ggs = reactionRepository.countByPostIdAndType(post.getId(), ReactionType.GG);
        
        String userReaction = null;
        if (userId != null) {
            var userReact = reactionRepository.findByPostIdAndUserId(post.getId(), userId);
            if (userReact.isPresent()) {
                userReaction = userReact.get().getType().name();
            }
        }
        
        return ReactionCountDTO.builder()
                .likes((int) likes)
                .wows((int) wows)
                .appreciates((int) appreciates)
                .ggs((int) ggs)
                .userReaction(userReaction)
                .build();
    }

    private PostResponseDTO toDTO(Post post, Long userId) {
        return PostResponseDTO.builder()
                .id(post.getId())
                .contenu(post.getContenu())
                .userId(post.getUserId())
                .userName(post.getUserName() != null ? post.getUserName() : "User #" + post.getUserId())
            .originalPostId(post.getOriginalPostId())
            .originalAuthorName(post.getOriginalAuthorName())
                .createdAt(post.getCreatedAt())
                .likeCount(post.getLikes().size())
                .commentCount(post.getComments().size())
                .photoUrls(post.getPhotos().stream().map(Photo::getUrl).collect(Collectors.toList()))
                .status(post.getStatus() != null ? post.getStatus().name() : PostStatus.PENDING.name())
                .reactions(buildReactionCounts(post, userId))
                .build();
    }

    private CommentResponseDTO toCommentDTO(Comment comment) {
        return CommentResponseDTO.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .userId(comment.getUserId())
                .userName(comment.getUserName() != null ? comment.getUserName() : "User #" + comment.getUserId())
                .texte(comment.getTexte())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
