package com.esprit.jobservice.config;

import com.esprit.jobservice.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean; import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration @EnableWebSecurity @RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(a -> a
                .requestMatchers("/v3/api-docs/**","/swagger-ui/**","/swagger-ui.html","/actuator/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/jobs/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/jobs/*/apply").hasAnyRole("STUDENT", "MENTOR", "ADMIN")
                .requestMatchers("/api/jobs/applications/**").hasAnyRole("ADMIN", "MENTOR", "STUDENT")
                .requestMatchers("/api/jobs/mentoring/**", "/api/jobs/sessions/**").hasAnyRole("MENTOR", "STUDENT", "ADMIN")
                .requestMatchers("/api/jobs/**").hasAnyRole("ADMIN", "MENTOR")
                .anyRequest().authenticated())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
