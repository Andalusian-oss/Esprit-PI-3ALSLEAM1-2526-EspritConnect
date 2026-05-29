package com.esprit.resourceservice.repository;

import com.esprit.resourceservice.entity.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByCategorieOrderByCreatedAtDesc(Resource.ResourceCategory categorie);
    List<Resource> findByTypeOrderByCreatedAtDesc(Resource.ResourceType type);
    List<Resource> findByUploadedByUserIdOrderByCreatedAtDesc(Long userId);
    List<Resource> findAllByOrderByCreatedAtDesc();
    Page<Resource> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Modifying
    @Query("UPDATE Resource r SET r.likeCount = r.likeCount + 1 WHERE r.id = :id")
    void incrementLikeCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Resource r SET r.likeCount = CASE WHEN r.likeCount > 0 THEN r.likeCount - 1 ELSE 0 END WHERE r.id = :id")
    void decrementLikeCount(@Param("id") Long id);
}
