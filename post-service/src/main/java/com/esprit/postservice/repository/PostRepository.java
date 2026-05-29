package com.esprit.postservice.repository;

import com.esprit.postservice.entity.Post;
import com.esprit.postservice.entity.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByOrderByCreatedAtDesc();
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Post> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Post> findByStatusOrderByCreatedAtDesc(PostStatus status);
    Page<Post> findByStatusOrderByCreatedAtDesc(PostStatus status, Pageable pageable);
}
