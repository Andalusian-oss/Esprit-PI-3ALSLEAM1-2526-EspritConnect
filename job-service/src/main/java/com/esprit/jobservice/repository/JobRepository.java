package com.esprit.jobservice.repository;

import com.esprit.jobservice.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByType(Job.JobType type);
}
