package com.esprit.messageservice.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Pushes real-time presence to auth-service based on WebSocket lifecycle:
 * a user goes online the moment their first socket connects and offline the
 * instant their last socket disconnects. Multiple tabs are reference-counted
 * so closing one tab while another is open does not mark the user offline.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketPresenceListener {

    private final RestTemplate restTemplate;

    @Value("${auth-service.url:http://auth-service:8081}")
    private String authServiceUrl;

    /** userId -> active WebSocket session ids */
    private final Map<Long, Set<String>> userSessions = new ConcurrentHashMap<>();

    @EventListener
    public void onConnected(SessionConnectedEvent event) {
        Long userId = resolveUserId(event.getUser());
        String sessionId = StompHeaderAccessor.wrap(event.getMessage()).getSessionId();
        if (userId == null || sessionId == null) return;

        Set<String> sessions = userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet());
        boolean wasOffline = sessions.isEmpty();
        sessions.add(sessionId);
        if (wasOffline) setPresence(userId, true);
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        Long userId = resolveUserId(event.getUser());
        if (userId == null) return;

        Set<String> sessions = userSessions.get(userId);
        if (sessions == null) return;
        sessions.remove(event.getSessionId());
        if (sessions.isEmpty()) {
            userSessions.remove(userId);
            setPresence(userId, false);
        }
    }

    private Long resolveUserId(Principal principal) {
        if (principal == null) return null;
        try {
            return Long.parseLong(principal.getName());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private void setPresence(Long userId, boolean online) {
        try {
            restTemplate.postForEntity(
                    authServiceUrl + "/api/auth/internal/presence/" + userId + "?online=" + online,
                    null, Void.class);
        } catch (Exception e) {
            log.warn("Failed to update presence for user {} (online={}): {}", userId, online, e.getMessage());
        }
    }
}
