package com.esprit.resourceservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceCategory categorie;

    private String fileUrl;
    private String lien;

    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(nullable = false)
    private Long uploadedByUserId;

    @Builder.Default
    private int likeCount = 0;

    @Builder.Default
    private int downloadCount = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum ResourceType { ARTICLE, PDF, VIDEO, LINK, TUTORIAL }
    public enum ResourceCategory { ACADEMIC, CAREER, TECHNICAL, SOCIAL, EVENT }
}
