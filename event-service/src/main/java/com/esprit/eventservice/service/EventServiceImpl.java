package com.esprit.eventservice.service;

import com.esprit.eventservice.dto.request.ClubRequestDTO;
import com.esprit.eventservice.dto.request.EventRequestDTO;
import com.esprit.eventservice.dto.response.ClubResponseDTO;
import com.esprit.eventservice.dto.response.EventRegistrationResponseDTO;
import com.esprit.eventservice.dto.response.EventResponseDTO;
import com.esprit.eventservice.entity.*;
import com.esprit.eventservice.exception.ResourceNotFoundException;
import com.esprit.eventservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final ClubMembershipRepository membershipRepository;
    private final EventRegistrationRepository registrationRepository;

    // ─── Club ──────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ClubResponseDTO createClub(ClubRequestDTO dto, Long userId) {
        Club club = Club.builder()
                .nom(dto.getNom())
                .description(dto.getDescription())
                .logoUrl(dto.getLogoUrl())
                .creatorUserId(userId)
                .build();
        Club saved = clubRepository.save(club);
        // Creator automatically becomes ADMIN member
        ClubMembership membership = ClubMembership.builder()
                .club(saved).userId(userId)
                .role(ClubMembership.MemberRole.ADMIN).build();
        membershipRepository.save(membership);
        return toClubDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClubResponseDTO> getAllClubs() {
        return clubRepository.findAll().stream().map(this::toClubDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClubResponseDTO getClubById(Long id) {
        return toClubDTO(findClub(id));
    }

    @Override
    @Transactional
    public ClubResponseDTO updateClub(Long id, ClubRequestDTO dto, Long userId) {
        Club club = findClub(id);
        if (!club.getCreatorUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        club.setNom(dto.getNom());
        if (dto.getDescription() != null) club.setDescription(dto.getDescription());
        if (dto.getLogoUrl() != null) club.setLogoUrl(dto.getLogoUrl());
        return toClubDTO(clubRepository.save(club));
    }

    @Override
    @Transactional
    public void deleteClub(Long id, Long userId) {
        Club club = findClub(id);
        if (!club.getCreatorUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        clubRepository.delete(club);
    }

    @Override
    @Transactional
    public void joinClub(Long clubId, Long userId) {
        if (membershipRepository.existsByClubIdAndUserId(clubId, userId))
            throw new IllegalArgumentException("Already a member");
        Club club = findClub(clubId);
        membershipRepository.save(ClubMembership.builder()
                .club(club).userId(userId).role(ClubMembership.MemberRole.MEMBER).build());
    }

    @Override
    @Transactional
    public void leaveClub(Long clubId, Long userId) {
        ClubMembership membership = membershipRepository.findByClubIdAndUserId(clubId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership not found"));
        membershipRepository.delete(membership);
    }

    // ─── Event ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public EventResponseDTO createEvent(EventRequestDTO dto, Long userId) {
        Event.EventBuilder builder = Event.builder()
                .titre(dto.getTitre())
                .description(dto.getDescription())
                .date(dto.getDate())
                .lieu(dto.getLieu())
                .categorie(dto.getCategorie())
            .attendeeLimit(dto.getAttendeeLimit())
                .creatorUserId(userId);
        if (dto.getClubId() != null) builder.club(findClub(dto.getClubId()));
        return toEventDTO(eventRepository.save(builder.build()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponseDTO> getAllEvents() {
        return eventRepository.findAllByOrderByDateAsc().stream()
                .map(this::toEventDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponseDTO> getEventsByClub(Long clubId) {
        return eventRepository.findByClubIdOrderByDateAsc(clubId).stream()
                .map(this::toEventDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponseDTO getEventById(Long id) {
        return toEventDTO(findEvent(id));
    }

    @Override
    @Transactional
    public EventResponseDTO updateEvent(Long id, EventRequestDTO dto, Long userId, String role) {
        Event event = findEvent(id);
        boolean isAdmin = "ADMIN".equals(role);
        if (!isAdmin && !event.getCreatorUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        event.setTitre(dto.getTitre());
        event.setDate(dto.getDate());
        if (dto.getDescription() != null) event.setDescription(dto.getDescription());
        if (dto.getLieu() != null) event.setLieu(dto.getLieu());
        if (dto.getCategorie() != null) event.setCategorie(dto.getCategorie());
        if (dto.getAttendeeLimit() != null && registrationRepository.countByEventId(id) > dto.getAttendeeLimit()) {
            throw new IllegalArgumentException("Attendee limit cannot be lower than the current number of registrations");
        }
        event.setAttendeeLimit(dto.getAttendeeLimit());
        return toEventDTO(eventRepository.save(event));
    }

    @Override
    @Transactional
    public void deleteEvent(Long id, Long userId, String role) {
        Event event = findEvent(id);
        boolean isAdmin = "ADMIN".equals(role);
        if (!isAdmin && !event.getCreatorUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        eventRepository.delete(event);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventRegistrationResponseDTO> getEventRegistrations(Long eventId, Long userId, String role) {
        Event event = findEvent(eventId);
        boolean isAdmin = "ADMIN".equals(role);
        if (!isAdmin && !event.getCreatorUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        return registrationRepository.findAllByEventIdOrderByCreatedAtAsc(eventId).stream()
                .map(this::toRegistrationDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EventRegistrationResponseDTO registerForEvent(Long eventId, Long userId) {
        if (registrationRepository.existsByEventIdAndUserId(eventId, userId))
            throw new IllegalArgumentException("Already registered");
        Event event = findEvent(eventId);
        long currentRegistrations = registrationRepository.countByEventId(eventId);
        if (event.getAttendeeLimit() != null && currentRegistrations >= event.getAttendeeLimit()) {
            throw new IllegalArgumentException("This event has reached its attendee limit");
        }
        EventRegistration registration = registrationRepository.save(EventRegistration.builder()
                .event(event)
                .userId(userId)
                .inviteCode(generateInviteCode())
                .createdAt(LocalDateTime.now())
                .build());
        return toRegistrationDTO(registration);
    }

    @Override
    @Transactional(readOnly = true)
    public EventRegistrationResponseDTO getMyRegistration(Long eventId, Long userId) {
        EventRegistration registration = registrationRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        return toRegistrationDTO(registration);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventRegistrationResponseDTO> getMyRegistrations(Long userId) {
        return registrationRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toRegistrationDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void unregisterFromEvent(Long eventId, Long userId) {
        if (!registrationRepository.existsByEventIdAndUserId(eventId, userId))
            throw new ResourceNotFoundException("Registration not found");
        registrationRepository.deleteByEventIdAndUserId(eventId, userId);
    }

    private Club findClub(Long id) {
        return clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found: " + id));
    }

    private Event findEvent(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
    }

    private String generateInviteCode() {
        return UUID.randomUUID().toString().replace("-", "").toUpperCase();
    }

    private ClubResponseDTO toClubDTO(Club club) {
        return ClubResponseDTO.builder()
                .id(club.getId()).nom(club.getNom()).description(club.getDescription())
                .logoUrl(club.getLogoUrl()).creatorUserId(club.getCreatorUserId())
                .memberCount(club.getMemberships().size()).build();
    }

    private EventResponseDTO toEventDTO(Event event) {
        int registrationCount = event.getRegistrations().size();
        Integer remainingSpots = event.getAttendeeLimit() == null
            ? null
            : Math.max(event.getAttendeeLimit() - registrationCount, 0);
        return EventResponseDTO.builder()
                .id(event.getId()).titre(event.getTitre()).description(event.getDescription())
                .date(event.getDate()).lieu(event.getLieu())
                .clubId(event.getClub() != null ? event.getClub().getId() : null)
                .clubNom(event.getClub() != null ? event.getClub().getNom() : null)
                .creatorUserId(event.getCreatorUserId())
            .registrationCount(registrationCount)
            .attendeeLimit(event.getAttendeeLimit())
            .remainingSpots(remainingSpots)
                .categorie(event.getCategorie()).build();
    }

        private EventRegistrationResponseDTO toRegistrationDTO(EventRegistration registration) {
        Long eventId = registration.getEvent().getId();
        return EventRegistrationResponseDTO.builder()
            .id(registration.getId())
            .eventId(eventId)
                .eventTitre(registration.getEvent().getTitre())
                .eventDate(registration.getEvent().getDate())
                .eventLieu(registration.getEvent().getLieu())
            .userId(registration.getUserId())
            .inviteCode(registration.getInviteCode())
            .qrPayload("ESPRIT_CONNECT_EVENT_INVITE|event=" + eventId + "|invite=" + registration.getInviteCode() + "|user=" + registration.getUserId())
            .createdAt(registration.getCreatedAt())
            .build();
        }
}
