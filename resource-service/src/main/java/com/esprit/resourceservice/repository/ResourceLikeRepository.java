package com.esprit.resourceservice.repository;

import com.esprit.resourceservice.entity.ResourceLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResourceLikeRepository extends JpaRepository<ResourceLike, Long> {
    Optional<ResourceLike> findByResourceIdAndUserId(Long resourceId, Long userId);
    boolean existsByResourceIdAndUserId(Long resourceId, Long userId);
    void deleteAllByResourceId(Long resourceId);
}
