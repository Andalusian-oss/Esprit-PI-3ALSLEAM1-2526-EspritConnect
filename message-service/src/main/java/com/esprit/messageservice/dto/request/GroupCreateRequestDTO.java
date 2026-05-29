package com.esprit.messageservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class GroupCreateRequestDTO {
    @NotBlank
    private String name;
    private String avatarUrl;
    private List<Long> memberIds;
}
