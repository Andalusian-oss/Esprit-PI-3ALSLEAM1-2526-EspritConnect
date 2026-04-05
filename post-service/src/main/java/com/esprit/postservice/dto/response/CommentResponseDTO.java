package com.esprit.postservice.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponseDTO {
    private Long id;
    private Long postId;
    private Long userId;
    private String texte;
    private LocalDateTime createdAt;
}
