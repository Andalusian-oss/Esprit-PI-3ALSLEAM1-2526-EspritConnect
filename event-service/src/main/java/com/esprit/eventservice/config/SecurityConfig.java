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
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/events/*/register", "/api/clubs/*/join").hasAnyRole("STUDENT", "MENTOR", "ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/events/*/unregister", "/api/clubs/*/leave").hasAnyRole("STUDENT", "MENTOR", "ADMIN")
                .requestMatchers("/api/events/**", "/api/clubs/**").hasAnyRole("ADMIN", "MENTOR")
                .anyRequest().authenticated())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
