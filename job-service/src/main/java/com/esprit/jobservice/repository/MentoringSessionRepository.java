package com.esprit.jobservice.repository;

import com.esprit.jobservice.entity.MentoringSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MentoringSessionRepository extends JpaRepository<MentoringSession, Long> {
    List<MentoringSession> findByMentoringId(Long mentoringId);
    List<MentoringSession> findByStatut(MentoringSession.SessionStatus statut);
}
