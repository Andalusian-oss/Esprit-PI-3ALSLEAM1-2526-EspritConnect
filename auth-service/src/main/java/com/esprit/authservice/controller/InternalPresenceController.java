package com.esprit.authservice.controller;

import com.esprit.authservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal, service-to-service presence endpoint. Called by message-service from its
 * WebSocket connect/disconnect listeners to flip a user online/offline instantly.
 * Reachable only on the internal Docker network; not routed for end-user auth.
 */
@RestController
@RequestMapping("/api/auth/internal")
@RequiredArgsConstructor
@Tag(name = "Internal")
public class InternalPresenceController {

    private final UserService userService;

    @PostMapping("/presence/{userId}")
    @Operation(summary = "Set a user's online presence (internal use)")
    public ResponseEntity<Void> setPresence(@PathVariable Long userId,
                                            @RequestParam boolean online) {
        userService.setPresence(userId, online);
        return ResponseEntity.noContent().build();
    }
}
