package com.esprit.resourceservice.dto;

import com.esprit.resourceservice.entity.Resource;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ResourceResponseDTO {
    private Long id;
    private String titre;
    private String description;
    private Resource.ResourceType type;
    private Resource.ResourceCategory categorie;
    private String fileUrl;
    private String lien;
    private String tags;
    private Long uploadedByUserId;
    private int likeCount;
    private int viewCount;
    private int downloadCount;
    private boolean likedByMe;
    private LocalDateTime createdAt;
}
