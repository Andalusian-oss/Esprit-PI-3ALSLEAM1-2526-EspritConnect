package com.esprit.resourceservice.dto;

import com.esprit.resourceservice.entity.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResourceRequestDTO {
    @NotBlank private String titre;
    private String description;
    @NotNull private Resource.ResourceType type;
    @NotNull private Resource.ResourceCategory categorie;
    private String fileUrl;
    private String lien;
    private String tags;
}
