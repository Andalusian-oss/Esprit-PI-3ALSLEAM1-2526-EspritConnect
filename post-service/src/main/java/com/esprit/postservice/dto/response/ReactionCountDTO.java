package com.esprit.postservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReactionCountDTO {
    private int likes;
    private int wows;
    private int appreciates;
    private int ggs;
    private String userReaction; // User's own reaction type (LIKE, WOW, APPRECIATE, GG, null)
}
