package com.esprit.messageservice.dto;

import com.esprit.messageservice.dto.request.MessageRequestDTO;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MessageRequestDTOTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void rejectsBlankMessageAndMissingRecipient() {
        MessageRequestDTO dto = new MessageRequestDTO();
        dto.setContenu("");

        assertThat(validator.validate(dto)).hasSizeGreaterThanOrEqualTo(2);
    }
}
