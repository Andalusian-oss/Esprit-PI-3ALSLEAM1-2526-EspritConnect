package com.esprit.resourceservice.service;

import com.esprit.resourceservice.dto.ResourceRequestDTO;
import com.esprit.resourceservice.dto.ResourceResponseDTO;
import com.esprit.resourceservice.entity.Resource;
import com.esprit.resourceservice.entity.ResourceLike;
import com.esprit.resourceservice.repository.ResourceLikeRepository;
import com.esprit.resourceservice.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceLikeRepository likeRepository;

    @Override @Transactional
    public ResourceResponseDTO create(ResourceRequestDTO dto, Long userId) {
        Resource r = Resource.builder()
                .titre(dto.getTitre()).description(dto.getDescription())
                .type(dto.getType()).categorie(dto.getCategorie())
                .fileUrl(dto.getFileUrl()).lien(dto.getLien())
                .tags(dto.getTags()).uploadedByUserId(userId)
                .build();
        return toDTO(resourceRepository.save(r), userId);
    }

    @Override @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getAll(Long currentUserId) {
        return resourceRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(r -> toDTO(r, currentUserId)).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getAll(Long currentUserId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return resourceRepository.findAllByOrderByCreatedAtDesc(pageable)
                .stream().map(r -> toDTO(r, currentUserId)).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getByCategory(Resource.ResourceCategory categorie, Long currentUserId) {
        return resourceRepository.findByCategorieOrderByCreatedAtDesc(categorie)
                .stream().map(r -> toDTO(r, currentUserId)).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public List<ResourceResponseDTO> getByType(Resource.ResourceType type, Long currentUserId) {
        return resourceRepository.findByTypeOrderByCreatedAtDesc(type)
                .stream().map(r -> toDTO(r, currentUserId)).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public ResourceResponseDTO getById(Long id, Long currentUserId) {
        return toDTO(find(id), currentUserId);
    }

    @Override @Transactional
    public ResourceResponseDTO update(Long id, ResourceRequestDTO dto, Long userId) {
        Resource r = find(id);
        if (!r.getUploadedByUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        r.setTitre(dto.getTitre());
        if (dto.getDescription() != null) r.setDescription(dto.getDescription());
        r.setType(dto.getType());
        r.setCategorie(dto.getCategorie());
        if (dto.getFileUrl() != null) r.setFileUrl(dto.getFileUrl());
        if (dto.getLien() != null) r.setLien(dto.getLien());
        if (dto.getTags() != null) r.setTags(dto.getTags());
        return toDTO(resourceRepository.save(r), userId);
    }

    @Override @Transactional
    public void delete(Long id, Long userId) {
        Resource r = find(id);
        if (!r.getUploadedByUserId().equals(userId)) throw new IllegalArgumentException("Not authorized");
        likeRepository.deleteAllByResourceId(id);
        resourceRepository.delete(r);
    }

    @Override @Transactional
    public ResourceResponseDTO toggleLike(Long id, Long userId) {
        var existing = likeRepository.findByResourceIdAndUserId(id, userId);
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            resourceRepository.decrementLikeCount(id);
        } else {
            Resource r = find(id);
            likeRepository.save(ResourceLike.builder().resource(r).userId(userId).build());
            resourceRepository.incrementLikeCount(id);
        }
        return toDTO(find(id), userId);
    }

    @Override @Transactional
    public ResourceResponseDTO incrementDownload(Long id) {
        Resource r = find(id);
        r.setDownloadCount(r.getDownloadCount() + 1);
        return toDTO(resourceRepository.save(r), null);
    }

    private Resource find(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new com.esprit.resourceservice.exception.ResourceNotFoundException("Resource not found: " + id));
    }

    private ResourceResponseDTO toDTO(Resource r, Long currentUserId) {
        boolean likedByMe = currentUserId != null && likeRepository.existsByResourceIdAndUserId(r.getId(), currentUserId);
        return ResourceResponseDTO.builder()
                .id(r.getId()).titre(r.getTitre()).description(r.getDescription())
                .type(r.getType()).categorie(r.getCategorie())
                .fileUrl(r.getFileUrl()).lien(r.getLien()).tags(r.getTags())
                .uploadedByUserId(r.getUploadedByUserId())
                .likeCount(r.getLikeCount()).downloadCount(r.getDownloadCount())
                .likedByMe(likedByMe).createdAt(r.getCreatedAt())
                .build();
    }
}
