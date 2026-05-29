package com.esprit.authservice.controller;

import com.esprit.authservice.dto.request.LoginRequestDTO;
import com.esprit.authservice.dto.request.RegisterRequestDTO;
import com.esprit.authservice.dto.response.AuthResponseDTO;
import com.esprit.authservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register and login endpoints")
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user — sends a verification email")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(dto));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT token")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(userService.login(dto));
    }

    @GetMapping(value = "/verify", produces = MediaType.TEXT_HTML_VALUE)
    @Operation(summary = "Verify email address via token link")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        try {
            String message = userService.verifyEmail(token);
            return ResponseEntity.ok(buildHtmlPage("Email Verified!", message,
                    "#27ae60", "Go to Login", "http://localhost:4200/login"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(buildHtmlPage("Verification Failed",
                    e.getMessage(), "#e74c3c", "Request new link",
                    "http://localhost:4200/resend-verification"));
        }
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend the email verification link")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestBody Map<String, String> body) {
        userService.resendVerification(body.get("email"));
        return ResponseEntity.ok(Map.of("message", "Verification email resent. Please check your inbox."));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset email")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        userService.forgotPassword(body.get("email"));
        return ResponseEntity.ok(Map.of("message",
                "If an account with that email exists, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token from email")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        userService.resetPassword(body.get("token"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now log in."));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password for authenticated user")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        UserDetails principal = (UserDetails) authentication.getPrincipal();
        userService.changePassword(principal.getUsername(), body.get("oldPassword"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout — sets the current user offline")
    public ResponseEntity<Void> logout(Authentication authentication) {
        if (authentication != null) {
            UserDetails principal = (UserDetails) authentication.getPrincipal();
            userService.logout(principal.getUsername());
        }
        return ResponseEntity.noContent().build();
    }

    // ── HTML helper ─────────────────────────────────────────────────────────────

    private String buildHtmlPage(String title, String message, String color,
                                  String btnText, String btnHref) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8"/>
                  <title>%s — EspritConnect</title>
                  <style>
                    body { font-family: Arial, sans-serif; background: #f4f4f4;
                           display: flex; justify-content: center; align-items: center;
                           min-height: 100vh; margin: 0; }
                    .card { background: #fff; border-radius: 10px; padding: 48px 40px;
                            max-width: 460px; width: 100%%;
                            box-shadow: 0 4px 16px rgba(0,0,0,.12); text-align: center; }
                    .icon { font-size: 56px; margin-bottom: 16px; }
                    h2 { color: %s; margin: 0 0 12px; }
                    p { color: #555; font-size: 15px; line-height: 1.6; }
                    a { display: inline-block; margin-top: 28px; padding: 12px 28px;
                        background: %s; color: #fff; text-decoration: none;
                        border-radius: 6px; font-weight: bold; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="icon">%s</div>
                    <h2>%s</h2>
                    <p>%s</p>
                    <a href="%s">%s</a>
                  </div>
                </body>
                </html>
                """.formatted(title, color, color,
                color.equals("#27ae60") ? "✅" : "❌",
                title, message, btnHref, btnText);
    }
}

