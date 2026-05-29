package com.esprit.messageservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MessageEditRequestDTO {
    @NotBlank
    private String contenu;
}
