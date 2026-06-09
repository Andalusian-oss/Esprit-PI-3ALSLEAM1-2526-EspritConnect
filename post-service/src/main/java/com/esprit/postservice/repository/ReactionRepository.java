package com.esprit.postservice.repository;

import com.esprit.postservice.entity.Reaction;
import com.esprit.postservice.entity.Reaction.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    
    Optional<Reaction> findByPostIdAndUserId(Long postId, Long userId);
    
    List<Reaction> findByPostId(Long postId);
    
    @Query("SELECT r.type, COUNT(r) FROM Reaction r WHERE r.post.id = :postId GROUP BY r.type")
    List<Object[]> countReactionsByType(@Param("postId") Long postId);
    
    long countByPostIdAndType(Long postId, ReactionType type);
    
    void deleteByPostIdAndUserId(Long postId, Long userId);
}
