package com.esprit.eventservice.dto;

import com.esprit.eventservice.dto.request.EventRequestDTO;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class EventRequestDTOTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void rejectsBlankTitleAndMissingDate() {
        EventRequestDTO dto = new EventRequestDTO();
        dto.setTitre("");
        dto.setDate(null);

        assertThat(validator.validate(dto)).hasSizeGreaterThanOrEqualTo(2);
    }

    @Test
    void allowsPastDateSoExistingEventsCanBeEdited() {
        // Future-date is enforced only on creation (service layer), not by DTO validation,
        // so editing an event whose date has already passed must not produce a violation.
        EventRequestDTO dto = new EventRequestDTO();
        dto.setTitre("Existing event");
        dto.setDate(LocalDateTime.now().minusDays(1));

        assertThat(validator.validate(dto)).isEmpty();
    }
}
