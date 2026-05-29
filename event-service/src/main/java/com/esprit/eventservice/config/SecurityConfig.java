package com.esprit.eventservice.config;

import com.esprit.eventservice.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/actuator/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/events/**", "/api/clubs/**").authenticated()
                // Register/unregister for events: all authenticated users
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/events/*/register").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/events/*/unregister").authenticated()
                // Join/leave clubs: all authenticated users
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/clubs/*/join").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/clubs/*/leave").authenticated()
                // Creating/editing events and clubs: admin, mentor only
                .requestMatchers("/api/events/**", "/api/clubs/**").hasAnyRole("ADMIN", "MENTOR")
                .anyRequest().authenticated())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
