package com.esprit.postservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequestDTO {

    @NotBlank(message = "Comment text is required")
    private String texte;

    private String userName;
}
