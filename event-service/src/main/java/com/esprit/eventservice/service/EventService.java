package com.esprit.eventservice.service;

import com.esprit.eventservice.dto.request.ClubRequestDTO;
import com.esprit.eventservice.dto.request.EventRequestDTO;
import com.esprit.eventservice.dto.response.ClubResponseDTO;
import com.esprit.eventservice.dto.response.EventResponseDTO;

import java.util.List;

public interface EventService {
    // Club
    ClubResponseDTO createClub(ClubRequestDTO dto, Long userId);
    List<ClubResponseDTO> getAllClubs();
    ClubResponseDTO getClubById(Long id);
    ClubResponseDTO updateClub(Long id, ClubRequestDTO dto, Long userId);
    void deleteClub(Long id, Long userId);
    void joinClub(Long clubId, Long userId);
    void leaveClub(Long clubId, Long userId);

    // Event
    EventResponseDTO createEvent(EventRequestDTO dto, Long userId);
    List<EventResponseDTO> getAllEvents();
    List<EventResponseDTO> getEventsByClub(Long clubId);
    EventResponseDTO getEventById(Long id);
    EventResponseDTO updateEvent(Long id, EventRequestDTO dto, Long userId);
    void deleteEvent(Long id, Long userId);
    void registerForEvent(Long eventId, Long userId);
    void unregisterFromEvent(Long eventId, Long userId);
}
