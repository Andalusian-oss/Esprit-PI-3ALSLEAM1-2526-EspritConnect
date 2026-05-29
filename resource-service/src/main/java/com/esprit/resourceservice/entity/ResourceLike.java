package com.esprit.resourceservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resource_likes",
       uniqueConstraints = @UniqueConstraint(columnNames = {"resource_id", "userId"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResourceLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(nullable = false)
    private Long userId;
}
