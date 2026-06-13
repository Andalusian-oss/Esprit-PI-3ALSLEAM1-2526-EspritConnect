package com.esprit.jobservice.service;

import com.esprit.jobservice.dto.request.*;
import com.esprit.jobservice.dto.response.*;
import java.util.List;

public interface JobService {
    // Jobs
    JobResponseDTO createJob(JobRequestDTO dto, Long userId);
    List<JobResponseDTO> getAllJobs();
    List<JobResponseDTO> getAllJobs(int page, int size);
    JobResponseDTO getJobById(Long id);
    JobResponseDTO updateJob(Long id, JobRequestDTO dto, Long userId);
    void deleteJob(Long id, Long userId);

    // Applications
    ApplicationResponseDTO apply(Long jobId, Long userId, String cvUrl);
    ApplicationResponseDTO updateMatchScore(Long appId, Integer score, Long userId);
    ApplicationResponseDTO updateCvUrl(Long appId, String cvUrl, Long userId);
    List<ApplicationResponseDTO> getApplicationsByJob(Long jobId);
    List<ApplicationResponseDTO> getRankedApplicants(Long jobId);
    List<ApplicationResponseDTO> getApplicationsByUser(Long userId);
    ApplicationResponseDTO updateApplicationStatus(Long appId, String status, Long userId);
    void withdrawApplication(Long appId, Long userId);

    // Mentoring
    MentoringResponseDTO requestMentoring(MentoringRequestDTO dto, Long mentoreUserId);
    List<MentoringResponseDTO> getMentoringAsMentor(Long userId);
    List<MentoringResponseDTO> getMentoringAsMentore(Long userId);
    List<MentoringResponseDTO> getAllMentorings();
    void completeMentoring(Long id, Long userId);
    void cancelMentoring(Long id, Long userId);

    // Sessions
    MentoringSessionResponseDTO addSession(Long mentoringId, MentoringSessionRequestDTO dto, Long userId);
    MentoringSessionResponseDTO startLiveSession(Long mentoringId, Long userId);
    MentoringSessionResponseDTO endSession(Long sessionId, Long userId);
    List<MentoringSessionResponseDTO> getSessionsByMentoring(Long mentoringId);
    MentoringSessionResponseDTO updateSessionStatus(Long sessionId, String status, Long userId);
}
