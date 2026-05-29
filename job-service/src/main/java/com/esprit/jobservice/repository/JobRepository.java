package com.esprit.jobservice.repository;

import com.esprit.jobservice.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByType(Job.JobType type);
    Page<Job> findAll(Pageable pageable);
}
