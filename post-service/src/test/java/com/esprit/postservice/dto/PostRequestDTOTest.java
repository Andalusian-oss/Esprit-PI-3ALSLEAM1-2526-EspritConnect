package com.esprit.postservice.dto;

import com.esprit.postservice.dto.request.PostRequestDTO;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PostRequestDTOTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void rejectsBlankPostContent() {
        PostRequestDTO dto = new PostRequestDTO();
        dto.setContenu("");

        assertThat(validator.validate(dto)).isNotEmpty();
    }
}
