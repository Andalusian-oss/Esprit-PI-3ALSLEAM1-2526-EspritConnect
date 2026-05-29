package com.esprit.messageservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.util.Map;

/**
 * Relays WebRTC signaling messages (offer/answer/ICE/end/reject)
 * between peers via the existing STOMP WebSocket broker.
 *
 * Flow: /app/call/{type}/{toUserId}  →  /user/{toUserId}/queue/call/{type}
 */
@Controller
@RequiredArgsConstructor
public class CallSignalingController {

    private final SimpMessagingTemplate messaging;

    @MessageMapping("/call/offer/{toUserId}")
    public void relayOffer(@DestinationVariable String toUserId,
                           @Payload Map<String, Object> payload) {
        messaging.convertAndSendToUser(toUserId, "/queue/call/offer", payload);
    }

    @MessageMapping("/call/answer/{toUserId}")
    public void relayAnswer(@DestinationVariable String toUserId,
                            @Payload Map<String, Object> payload) {
        messaging.convertAndSendToUser(toUserId, "/queue/call/answer", payload);
    }

    @MessageMapping("/call/ice/{toUserId}")
    public void relayIce(@DestinationVariable String toUserId,
                         @Payload Map<String, Object> payload) {
        messaging.convertAndSendToUser(toUserId, "/queue/call/ice", payload);
    }

    @MessageMapping("/call/end/{toUserId}")
    public void relayEnd(@DestinationVariable String toUserId,
                         @Payload Map<String, Object> payload) {
        messaging.convertAndSendToUser(toUserId, "/queue/call/end", payload);
    }

    @MessageMapping("/call/reject/{toUserId}")
    public void relayReject(@DestinationVariable String toUserId,
                            @Payload Map<String, Object> payload) {
        messaging.convertAndSendToUser(toUserId, "/queue/call/reject", payload);
    }
}
