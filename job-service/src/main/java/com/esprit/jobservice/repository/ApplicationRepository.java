package com.esprit.jobservice.repository;

import com.esprit.jobservice.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByJobId(Long jobId);
    List<Application> findByApplicantUserId(Long userId);
    boolean existsByJobIdAndApplicantUserId(Long jobId, Long userId);
}
