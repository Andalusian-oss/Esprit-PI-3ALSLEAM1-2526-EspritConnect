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
                .requestMatchers("/v3/api-docs/**","/swagger-ui/**","/swagger-ui.html","/actuator/**","/api/jobs/uploads/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/jobs/**").authenticated()
                // CV upload: any authenticated user (student, alumni, company, etc.)
                .requestMatchers(HttpMethod.POST, "/api/jobs/upload").authenticated()
                // Applying for jobs: students, alumni, employe, company, mentor, admin
                .requestMatchers(HttpMethod.POST, "/api/jobs/*/apply").authenticated()
                // Applications management: recruiters and applicants
                .requestMatchers(HttpMethod.PATCH, "/api/jobs/applications/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/jobs/applications/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/jobs/applications/**").authenticated()
                // Mentoring: any authenticated user
                .requestMatchers("/api/jobs/mentoring/**", "/api/jobs/sessions/**").authenticated()
                // Creating/editing jobs: admin, mentor, company
                .requestMatchers(HttpMethod.POST, "/api/jobs", "/api/jobs/").hasAnyRole("ADMIN", "MENTOR", "COMPANY")
                .requestMatchers(HttpMethod.POST, "/api/jobs/**").hasAnyRole("ADMIN", "MENTOR", "COMPANY")
                .requestMatchers(HttpMethod.PUT, "/api/jobs/**").hasAnyRole("ADMIN", "MENTOR", "COMPANY")
                .requestMatchers(HttpMethod.DELETE, "/api/jobs/**").hasAnyRole("ADMIN", "MENTOR", "COMPANY")
                .anyRequest().authenticated())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
