package com.esprit.postservice.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class PostRequestDTO {

    private String contenu;

    private List<String> photoUrls;

    private String userName;
    private Boolean autoApprove;
    private Long originalPostId;
    private String originalAuthorName;
}
