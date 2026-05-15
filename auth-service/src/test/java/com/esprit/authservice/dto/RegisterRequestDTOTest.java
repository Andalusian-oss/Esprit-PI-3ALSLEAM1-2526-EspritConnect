package com.esprit.authservice.dto;

import com.esprit.authservice.dto.request.RegisterRequestDTO;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RegisterRequestDTOTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void rejectsInvalidRegistrationPayload() {
        RegisterRequestDTO dto = new RegisterRequestDTO();
        dto.setEmail("invalid-email");
        dto.setPassword("123");

        assertThat(validator.validate(dto)).isNotEmpty();
    }
}
