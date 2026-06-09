package com.esprit.postservice.dto.request;

import com.esprit.postservice.entity.Reaction.ReactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReactionRequestDTO {
    private ReactionType type; // LIKE, WOW, APPRECIATE, GG
}
