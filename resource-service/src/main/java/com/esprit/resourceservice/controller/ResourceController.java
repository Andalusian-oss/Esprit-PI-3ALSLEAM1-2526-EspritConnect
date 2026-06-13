package com.esprit.resourceservice.controller;

import com.esprit.resourceservice.dto.ResourceRequestDTO;
import com.esprit.resourceservice.dto.ResourceResponseDTO;
import com.esprit.resourceservice.entity.Resource;
import com.esprit.resourceservice.security.JwtUtil;
import com.esprit.resourceservice.service.ResourceService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@Tag(name = "Resources")
@SecurityRequirement(name = "bearerAuth")
public class ResourceController {

    private final ResourceService resourceService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<ResourceResponseDTO> create(@Valid @RequestBody ResourceRequestDTO dto, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.create(dto, userId(req)));
    }

    @GetMapping
    public ResponseEntity<List<ResourceResponseDTO>> getAll(
            HttpServletRequest req,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(resourceService.getAll(userId(req), page, size));
    }

    @GetMapping("/category/{categorie}")
    public ResponseEntity<List<ResourceResponseDTO>> getByCategory(@PathVariable Resource.ResourceCategory categorie, HttpServletRequest req) {
        return ResponseEntity.ok(resourceService.getByCategory(categorie, userId(req)));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<ResourceResponseDTO>> getByType(@PathVariable Resource.ResourceType type, HttpServletRequest req) {
        return ResponseEntity.ok(resourceService.getByType(type, userId(req)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> getById(@PathVariable Long id, HttpServletRequest req) {
        return ResponseEntity.ok(resourceService.getById(id, userId(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> update(@PathVariable Long id, @Valid @RequestBody ResourceRequestDTO dto, HttpServletRequest req) {
        return ResponseEntity.ok(resourceService.update(id, dto, userId(req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest req) {
        resourceService.delete(id, userId(req));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ResourceResponseDTO> toggleLike(@PathVariable Long id, HttpServletRequest req) {
        return ResponseEntity.ok(resourceService.toggleLike(id, userId(req)));
    }

    @PostMapping("/{id}/download")
    public ResponseEntity<ResourceResponseDTO> download(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.incrementDownload(id));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<ResourceResponseDTO> view(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.incrementView(id));
    }

    private Long userId(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.extractUserId(auth.substring(7));
        throw new IllegalArgumentException("Missing Authorization header");
    }
}
