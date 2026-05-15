package com.esprit.authservice.controller;

import com.esprit.authservice.entity.EspritReference;
import com.esprit.authservice.repository.EspritReferenceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin-only controller to manage the EspritReference table.
 * Allows seeding/updating the school's identity reference data
 * (espritId ↔ CIN ↔ expectedRole mappings).
 */
@RestController
@RequestMapping("/api/auth/reference")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "EspritReference", description = "Admin management of espritId reference data")
@SecurityRequirement(name = "bearerAuth")
public class EspritReferenceController {

    private final EspritReferenceRepository espritReferenceRepository;

    @GetMapping
    @Operation(summary = "List all reference entries")
    public ResponseEntity<List<EspritReference>> getAll() {
        return ResponseEntity.ok(espritReferenceRepository.findAll());
    }

    @PostMapping
    @Operation(summary = "Create a new reference entry")
    public ResponseEntity<EspritReference> create(@RequestBody EspritReference ref) {
        ref.setId(null); // ensure insert
        return ResponseEntity.status(HttpStatus.CREATED).body(espritReferenceRepository.save(ref));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing reference entry")
    public ResponseEntity<EspritReference> update(@PathVariable Long id, @RequestBody EspritReference ref) {
        if (!espritReferenceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        ref.setId(id);
        return ResponseEntity.ok(espritReferenceRepository.save(ref));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a reference entry")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!espritReferenceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        espritReferenceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
