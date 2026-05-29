package com.esprit.authservice.controller;

import com.esprit.authservice.dto.request.UpdateUserRequestDTO;
import com.esprit.authservice.dto.response.UserResponseDTO;
import com.esprit.authservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all users (ADMIN only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/online")
    @Operation(summary = "List online users")
    public ResponseEntity<List<UserResponseDTO>> getOnlineUsers() {
        return ResponseEntity.ok(userService.getOnlineUsers());
    }

    @GetMapping("/search")
    @Operation(summary = "Search users by name or email")
    public ResponseEntity<List<UserResponseDTO>> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(userService.searchUsers(q));
    }

    @GetMapping("/bulk")
    @Operation(summary = "Get multiple users by IDs")
    public ResponseEntity<List<UserResponseDTO>> getUsersByIds(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(userService.getUsersByIds(ids));
    }

    @GetMapping("/{id:[0-9]+}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id:[0-9]+}")
    @Operation(summary = "Update own profile (ADMIN can update any user)")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id,
                                                      @Valid @RequestBody UpdateUserRequestDTO dto,
                                                      Authentication authentication) {
        UserDetails principal = (UserDetails) authentication.getPrincipal();
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        UserResponseDTO current = userService.getUserByEmail(principal.getUsername());
        if (!isAdmin && !current.getId().equals(id)) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot update another user's profile");
        }
        // Only admins can change the role field — clear it for non-admins
        if (!isAdmin) {
            dto.setRole(null);
        }
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }

    @DeleteMapping("/{id:[0-9]+}")
    @Operation(summary = "Delete user (ADMIN only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/directory")
    @Operation(summary = "Public user directory for recruiters, mentors and admins")
    @PreAuthorize("hasAnyRole('ADMIN','COMPANY','MENTOR','ENSEIGNANT')")
    public ResponseEntity<List<UserResponseDTO>> getDirectory(
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(userService.getDirectoryUsers(role));
    }

    // ── Company approval ────────────────────────────────────────────────────

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List company accounts pending approval (ADMIN only)")
    public ResponseEntity<List<UserResponseDTO>> getPendingCompanies() {
        return ResponseEntity.ok(userService.getPendingCompanies());
    }

    @PatchMapping("/{id:[0-9]+}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve a company account (ADMIN only)")
    public ResponseEntity<UserResponseDTO> approveUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.approveUser(id));
    }

    @DeleteMapping("/{id:[0-9]+}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject and delete a company account (ADMIN only)")
    public ResponseEntity<Void> rejectUser(@PathVariable Long id) {
        userService.rejectUser(id);
        return ResponseEntity.noContent().build();
    }

}
