package com.esprit.resourceservice.service;

import com.esprit.resourceservice.dto.ResourceRequestDTO;
import com.esprit.resourceservice.dto.ResourceResponseDTO;
import com.esprit.resourceservice.entity.Resource;

import java.util.List;

public interface ResourceService {
    ResourceResponseDTO create(ResourceRequestDTO dto, Long userId);
    List<ResourceResponseDTO> getAll(Long currentUserId);
    List<ResourceResponseDTO> getAll(Long currentUserId, int page, int size);
    List<ResourceResponseDTO> getByCategory(Resource.ResourceCategory categorie, Long currentUserId);
    List<ResourceResponseDTO> getByType(Resource.ResourceType type, Long currentUserId);
    ResourceResponseDTO getById(Long id, Long currentUserId);
    ResourceResponseDTO update(Long id, ResourceRequestDTO dto, Long userId);
    void delete(Long id, Long userId);
    ResourceResponseDTO toggleLike(Long id, Long userId);
    ResourceResponseDTO incrementDownload(Long id);
}
