package com.esprit.jobservice.dto;

import com.esprit.jobservice.dto.request.JobRequestDTO;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JobRequestDTOTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void rejectsMissingRequiredJobFields() {
        JobRequestDTO dto = new JobRequestDTO();
        dto.setTitre("");
        dto.setEntreprise("");

        assertThat(validator.validate(dto)).hasSizeGreaterThanOrEqualTo(3);
    }
}
