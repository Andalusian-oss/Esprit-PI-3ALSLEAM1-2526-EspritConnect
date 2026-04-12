package com.esprit.messageservice.controller;

import com.esprit.messageservice.dto.request.MessageRequestDTO;
import com.esprit.messageservice.dto.response.*;
import com.esprit.messageservice.security.JwtUtil;
import com.esprit.messageservice.service.MessageService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Tag(name = "Messages")
@SecurityRequirement(name = "bearerAuth")
public class MessageController {

    private final MessageService messageService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<MessageResponseDTO> send(@Valid @RequestBody MessageRequestDTO dto,
                                                    HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(messageService.sendMessage(dto, extractUserId(req)));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponseDTO>> myConversations(HttpServletRequest req) {
        return ResponseEntity.ok(messageService.getMyConversations(extractUserId(req)));
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<List<MessageResponseDTO>> getMessages(@PathVariable Long conversationId,
                                                                 HttpServletRequest req) {
        return ResponseEntity.ok(messageService.getMessages(conversationId, extractUserId(req)));
    }

    @PatchMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long conversationId, HttpServletRequest req) {
        messageService.markAsRead(conversationId, extractUserId(req));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> delete(@PathVariable Long messageId, HttpServletRequest req) {
        messageService.deleteMessage(messageId, extractUserId(req));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponseDTO>> getNotifications(HttpServletRequest req) {
        return ResponseEntity.ok(messageService.getMyNotifications(extractUserId(req)));
    }

    @PatchMapping("/notifications/{notificationId}/read")
    public ResponseEntity<Void> markNotifRead(@PathVariable Long notificationId, HttpServletRequest req) {
        messageService.markNotificationRead(notificationId, extractUserId(req));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(HttpServletRequest req) {
        return ResponseEntity.ok(Map.of("count", messageService.countUnreadNotifications(extractUserId(req))));
    }

    private Long extractUserId(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return jwtUtil.extractUserId(auth.substring(7));
        throw new IllegalArgumentException("Missing Authorization header");
    }
}
