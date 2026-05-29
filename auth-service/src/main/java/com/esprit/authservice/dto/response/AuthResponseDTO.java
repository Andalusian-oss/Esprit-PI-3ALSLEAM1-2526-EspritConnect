package com.esprit.authservice.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponseDTO {
    private String token;
    private String tokenType;
    private UserResponseDTO user;
    private String message;
}
