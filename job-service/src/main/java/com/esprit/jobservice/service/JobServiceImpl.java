package com.esprit.jobservice.service;

import com.esprit.jobservice.dto.request.*;
import com.esprit.jobservice.dto.response.*;
import com.esprit.jobservice.entity.*;
import com.esprit.jobservice.exception.ResourceNotFoundException;
import com.esprit.jobservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final MentoringRepository mentoringRepository;
    private final MentoringSessionRepository sessionRepository;

    // ─── Jobs ──────────────────────────────────────────────────────────────────

    @Override @Transactional
    public JobResponseDTO createJob(JobRequestDTO dto, Long userId) {
        Job job = Job.builder().titre(dto.getTitre()).entreprise(dto.getEntreprise())
                .description(dto.getDescription()).type(dto.getType())
                .lieu(dto.getLieu()).posterUserId(userId).build();
        return toJobDTO(jobRepository.save(job));
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponseDTO> getAllJobs() {
        return jobRepository.findAll().stream().map(this::toJobDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobResponseDTO> getAllJobs(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return jobRepository.findAll(pageable).stream().map(this::toJobDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponseDTO getJobById(Long id) { return toJobDTO(findJob(id)); }

    @Override @Transactional
    public JobResponseDTO updateJob(Long id, JobRequestDTO dto, Long userId) {
        Job job = findJob(id);
        if (!job.getPosterUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        job.setTitre(dto.getTitre()); job.setEntreprise(dto.getEntreprise());
        job.setType(dto.getType());
        if (dto.getDescription() != null) job.setDescription(dto.getDescription());
        if (dto.getLieu() != null) job.setLieu(dto.getLieu());
        return toJobDTO(jobRepository.save(job));
    }

    @Override @Transactional
    public void deleteJob(Long id, Long userId) {
        Job job = findJob(id);
        if (!job.getPosterUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        jobRepository.delete(job);
    }

    // ─── Applications ──────────────────────────────────────────────────────────

    @Override @Transactional
    public ApplicationResponseDTO apply(Long jobId, Long userId, String cvUrl) {
        if (applicationRepository.existsByJobIdAndApplicantUserId(jobId, userId))
            throw new IllegalArgumentException("Already applied");
        Job job = findJob(jobId);
        Application app = Application.builder().job(job).applicantUserId(userId).cvUrl(cvUrl).build();
        return toAppDTO(applicationRepository.save(app));
    }

    @Override @Transactional
    public ApplicationResponseDTO updateMatchScore(Long appId, Integer score, Long userId) {
        Application app = findApp(appId);
        app.setMatchScore(score);
        return toAppDTO(applicationRepository.save(app));
    }

    @Override @Transactional
    public ApplicationResponseDTO updateCvUrl(Long appId, String cvUrl, Long userId) {
        Application app = findApp(appId);
        if (!app.getApplicantUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        app.setCvUrl(cvUrl);
        return toAppDTO(applicationRepository.save(app));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponseDTO> getApplicationsByJob(Long jobId) {
        return applicationRepository.findByJobId(jobId).stream().map(this::toAppDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponseDTO> getRankedApplicants(Long jobId) {
        return applicationRepository.findByJobId(jobId).stream()
                .sorted(Comparator.comparingInt((Application a) -> a.getMatchScore() == null ? Integer.MIN_VALUE : -a.getMatchScore())
                        .thenComparing(a -> a.getId()))
                .map(this::toAppDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponseDTO> getApplicationsByUser(Long userId) {
        return applicationRepository.findByApplicantUserId(userId).stream().map(this::toAppDTO).collect(Collectors.toList());
    }

    @Override @Transactional
    public ApplicationResponseDTO updateApplicationStatus(Long appId, String status, Long userId) {
        Application app = findApp(appId);
        Long jobPosterId = app.getJob().getPosterUserId();
        if (!jobPosterId.equals(userId)) throw new IllegalArgumentException("Only job poster can change application status");
        app.setStatut(Application.ApplicationStatus.valueOf(status.toUpperCase()));
        return toAppDTO(applicationRepository.save(app));
    }

    @Override @Transactional
    public void withdrawApplication(Long appId, Long userId) {
        Application app = findApp(appId);
        if (!app.getApplicantUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        applicationRepository.delete(app);
    }

    // ─── Mentoring ─────────────────────────────────────────────────────────────

    @Override @Transactional
    public MentoringResponseDTO requestMentoring(MentoringRequestDTO dto, Long mentoreUserId) {
        Mentoring m = Mentoring.builder().mentorUserId(dto.getMentorUserId())
                .mentoreUserId(mentoreUserId).domaine(dto.getDomaine()).build();
        return toMentoringDTO(mentoringRepository.save(m));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentoringResponseDTO> getMentoringAsMentor(Long userId) {
        return mentoringRepository.findByMentorUserId(userId).stream()
                .map(this::toMentoringDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentoringResponseDTO> getMentoringAsMentore(Long userId) {
        return mentoringRepository.findByMentoreUserId(userId).stream()
                .map(this::toMentoringDTO).collect(Collectors.toList());
    }

    @Override @Transactional
    public void completeMentoring(Long id, Long userId) {
        Mentoring m = findMentoring(id);
        if (!m.getMentorUserId().equals(userId) && !m.getMentoreUserId().equals(userId))
            throw new IllegalArgumentException("Not authorized");
        m.setStatut(Mentoring.MentoringStatus.COMPLETED);
        mentoringRepository.save(m);
    }

    @Override @Transactional
    public void cancelMentoring(Long id, Long userId) {
        Mentoring m = findMentoring(id);
        if (!m.getMentorUserId().equals(userId) && !m.getMentoreUserId().equals(userId))
            throw new IllegalArgumentException("Not authorized");
        m.setStatut(Mentoring.MentoringStatus.CANCELLED);
        mentoringRepository.save(m);
    }

    // ─── Sessions ──────────────────────────────────────────────────────────────

    @Override @Transactional
    public MentoringSessionResponseDTO addSession(Long mentoringId, MentoringSessionRequestDTO dto, Long userId) {
        Mentoring m = findMentoring(mentoringId);
        if (!m.getMentorUserId().equals(userId)) throw new IllegalArgumentException("Only mentor can add sessions");
        MentoringSession session = MentoringSession.builder()
                .mentoring(m).date(dto.getDate()).dureeMinutes(dto.getDureeMinutes()).build();
        return toSessionDTO(sessionRepository.save(session));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentoringSessionResponseDTO> getSessionsByMentoring(Long mentoringId) {
        return sessionRepository.findByMentoringId(mentoringId).stream()
                .map(this::toSessionDTO).collect(Collectors.toList());
    }

    @Override @Transactional
    public MentoringSessionResponseDTO updateSessionStatus(Long sessionId, String status, Long userId) {
        MentoringSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));
        session.setStatut(MentoringSession.SessionStatus.valueOf(status.toUpperCase()));
        return toSessionDTO(sessionRepository.save(session));
    }

    private Job findJob(Long id) {
        return jobRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));
    }
    private Application findApp(Long id) {
        return applicationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
    }
    private Mentoring findMentoring(Long id) {
        return mentoringRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Mentoring not found: " + id));
    }

    private JobResponseDTO toJobDTO(Job j) {
        return JobResponseDTO.builder().id(j.getId()).titre(j.getTitre()).entreprise(j.getEntreprise())
                .description(j.getDescription()).type(j.getType()).lieu(j.getLieu())
                .posterUserId(j.getPosterUserId()).applicationCount(j.getApplications().size()).build();
    }
    private ApplicationResponseDTO toAppDTO(Application a) {
        return ApplicationResponseDTO.builder().id(a.getId()).jobId(a.getJob().getId())
                .jobTitre(a.getJob().getTitre()).applicantUserId(a.getApplicantUserId())
                .statut(a.getStatut()).cvUrl(a.getCvUrl()).matchScore(a.getMatchScore()).build();
    }
    private MentoringResponseDTO toMentoringDTO(Mentoring m) {
        return MentoringResponseDTO.builder().id(m.getId()).mentorUserId(m.getMentorUserId())
                .mentoreUserId(m.getMentoreUserId()).domaine(m.getDomaine()).statut(m.getStatut())
                .sessionCount(m.getSessions().size()).build();
    }
    private MentoringSessionResponseDTO toSessionDTO(MentoringSession s) {
        return MentoringSessionResponseDTO.builder().id(s.getId())
                .mentoringId(s.getMentoring().getId()).date(s.getDate())
                .dureeMinutes(s.getDureeMinutes()).statut(s.getStatut()).build();
    }
}
