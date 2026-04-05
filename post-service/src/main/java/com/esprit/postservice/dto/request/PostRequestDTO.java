package com.esprit.postservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class PostRequestDTO {

    @NotBlank(message = "Content is required")
    private String contenu;

    private List<String> photoUrls;
}
