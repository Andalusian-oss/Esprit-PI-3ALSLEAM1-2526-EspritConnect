package com.esprit.postservice.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PostResponseDTO {
    private Long id;
    private String contenu;
    private Long userId;
    private LocalDateTime createdAt;
    private String userName;
    private int likeCount;
    private int commentCount;
    private List<String> photoUrls;
}
