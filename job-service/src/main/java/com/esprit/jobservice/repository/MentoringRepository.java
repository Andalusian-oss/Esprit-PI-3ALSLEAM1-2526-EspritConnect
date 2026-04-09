package com.esprit.jobservice.repository;

import com.esprit.jobservice.entity.Mentoring;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MentoringRepository extends JpaRepository<Mentoring, Long> {
    List<Mentoring> findByMentorUserId(Long mentorId);
    List<Mentoring> findByMentoreUserId(Long mentoreId);
}
