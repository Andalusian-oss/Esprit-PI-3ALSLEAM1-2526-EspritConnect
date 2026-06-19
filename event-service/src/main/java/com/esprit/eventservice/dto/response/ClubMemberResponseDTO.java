package com.esprit.eventservice.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClubMemberResponseDTO {
    private Long id;
    private Long clubId;
    private Long userId;
    private String role;
    private String status;
}
