package com.esprit.jobservice.security;

import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Component;
import java.security.Key;

@Component
public class JwtUtil {
    @Value("${jwt.secret}") private String secret;
    private Key getSigningKey() { return Keys.hmacShaKeyFor(secret.getBytes()); }
    public Long extractUserId(String token) {
        Object userId = getClaims(token).get("userId");
        if (userId instanceof Integer) return ((Integer) userId).longValue();
        if (userId instanceof Long) return (Long) userId;
        return null;
    }
    public String extractEmail(String token) { return getClaims(token).getSubject(); }
    public String extractRole(String token) { return getClaims(token).get("role", String.class); }
    public boolean isTokenValid(String token) {
        try { getClaims(token); return true; } catch (JwtException | IllegalArgumentException e) { return false; }
    }
    private Claims getClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
    }
}
