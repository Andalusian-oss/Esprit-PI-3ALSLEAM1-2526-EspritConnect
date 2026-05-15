package com.esprit.authservice.controller;

import com.esprit.authservice.dto.request.LoginRequestDTO;
import com.esprit.authservice.dto.request.RegisterRequestDTO;
import com.esprit.authservice.dto.response.AuthResponseDTO;
import com.esprit.authservice.dto.response.UserResponseDTO;
import com.esprit.authservice.entity.Role;
import com.esprit.authservice.config.SecurityConfig;
import com.esprit.authservice.security.JwtAuthFilter;
import com.esprit.authservice.security.UserDetailsServiceImpl;
import com.esprit.authservice.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web-layer slice tests for AuthController (/api/auth/register, /api/auth/login, /api/auth/logout).
 *
 * No database is used — UserService is fully mocked.
 * Spring Security is loaded but JwtAuthFilter is mocked to pass requests through.
 *
 * Run with: mvn test -pl auth-service -Dtest=AuthControllerTest  (when Maven is available)
 */
@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)   // loads real CSRF-disable + @EnableMethodSecurity
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    // ── Mocked dependencies ──────────────────────────────────────────────────
    @MockBean private UserService userService;
    // Required by SecurityConfig (loaded by @WebMvcTest)
    @MockBean private JwtAuthFilter jwtAuthFilter;
    @MockBean private UserDetailsServiceImpl userDetailsService;

    /**
     * Make the mocked JwtAuthFilter pass every request to the next filter unchanged,
     * so that the DispatcherServlet can reach the controller.
     */
    @BeforeEach
    void letFilterChainThrough() throws Exception {
        doAnswer(inv -> {
            FilterChain chain = inv.getArgument(2);
            chain.doFilter(inv.getArgument(0), inv.getArgument(1));
            return null;
        }).when(jwtAuthFilter).doFilter(any(), any(), any());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private AuthResponseDTO buildAuthResponse(boolean approved) {
        UserResponseDTO user = UserResponseDTO.builder()
                .id(1L)
                .email("amine@esprit.tn")
                .prenom("Amine")
                .nom("Ben Salem")
                .role(Role.STUDENT)
                .approved(approved)
                .online(false)
                .build();
        return AuthResponseDTO.builder()
                .token("jwt-token")
                .tokenType("Bearer")
                .user(user)
                .build();
    }

    private RegisterRequestDTO validStudentRegisterBody() {
        RegisterRequestDTO dto = new RegisterRequestDTO();
        dto.setEmail("amine@esprit.tn");
        dto.setPassword("secret123");
        dto.setPrenom("Amine");
        dto.setNom("Ben Salem");
        dto.setRole(Role.STUDENT);
        dto.setEspritId("ESP-2024-001");
        dto.setCin("12345678");
        return dto;
    }

    // ════════════════════════════════════════════════════════════════════════
    //  POST /api/auth/register
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void register_student_returns201WithTokenAndUser() throws Exception {
        when(userService.register(any())).thenReturn(buildAuthResponse(true));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validStudentRegisterBody())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("amine@esprit.tn"))
                .andExpect(jsonPath("$.user.approved").value(true));
    }

    @Test
    void register_returns400_whenBodyIsEmpty() throws Exception {
        // Jakarta Bean Validation rejects an empty body (missing @NotBlank fields)
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    void register_returns400_whenEmailFormatInvalid() throws Exception {
        RegisterRequestDTO dto = validStudentRegisterBody();
        dto.setEmail("not-an-email");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").exists());
    }

    @Test
    void register_returns400_whenPasswordTooShort() throws Exception {
        RegisterRequestDTO dto = validStudentRegisterBody();
        dto.setPassword("123"); // min length is 6

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    void register_returns400_whenEmailAlreadyUsed() throws Exception {
        when(userService.register(any()))
                .thenThrow(new IllegalArgumentException("Email already in use: amine@esprit.tn"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validStudentRegisterBody())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email already in use: amine@esprit.tn"));
    }

    @Test
    void register_returns400_whenEspritIdCinNotFound() throws Exception {
        when(userService.register(any()))
                .thenThrow(new IllegalArgumentException(
                        "Esprit ID / CIN combination not found. Contact the administration."));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validStudentRegisterBody())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Esprit ID / CIN combination not found. Contact the administration."));
    }

    @Test
    void register_company_returns201WithApprovedFalse() throws Exception {
        RegisterRequestDTO dto = new RegisterRequestDTO();
        dto.setEmail("acme@company.tn");
        dto.setPassword("pass123");
        dto.setPrenom("Acme Corp");
        dto.setNom("Acme Corp");
        dto.setRole(Role.COMPANY);

        UserResponseDTO companyUser = UserResponseDTO.builder()
                .id(2L).email("acme@company.tn").prenom("Acme Corp").nom("Acme Corp")
                .role(Role.COMPANY).approved(false).build();
        AuthResponseDTO response = AuthResponseDTO.builder()
                .token("jwt").tokenType("Bearer").user(companyUser).build();

        when(userService.register(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.approved").value(false))
                .andExpect(jsonPath("$.user.role").value("COMPANY"));
    }

    // ════════════════════════════════════════════════════════════════════════
    //  POST /api/auth/login
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void login_returns200WithTokenAndUserInfo() throws Exception {
        LoginRequestDTO body = new LoginRequestDTO();
        body.setEmail("amine@esprit.tn");
        body.setPassword("secret123");

        when(userService.login(any())).thenReturn(buildAuthResponse(true));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("amine@esprit.tn"))
                .andExpect(jsonPath("$.user.approved").value(true));
    }

    @Test
    void login_returns400_whenBodyInvalid() throws Exception {
        // empty body — email and password are @NotBlank
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    void login_returns401_whenPasswordWrong() throws Exception {
        LoginRequestDTO body = new LoginRequestDTO();
        body.setEmail("amine@esprit.tn");
        body.setPassword("wrongpass");

        when(userService.login(any()))
                .thenThrow(new BadCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void login_returns401_whenAccountPendingApproval() throws Exception {
        LoginRequestDTO body = new LoginRequestDTO();
        body.setEmail("acme@company.tn");
        body.setPassword("pass123");

        when(userService.login(any()))
                .thenThrow(new BadCredentialsException("Account pending admin approval"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Account pending admin approval"));
    }

    // ════════════════════════════════════════════════════════════════════════
    //  POST /api/auth/logout
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void logout_returns204_whenAuthenticated() throws Exception {
        // Simulate an authenticated user via Spring Security Test
        mockMvc.perform(post("/api/auth/logout")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                                .user("amine@esprit.tn").roles("STUDENT")))
                .andExpect(status().isNoContent());
    }

    @Test
    void logout_returns401_whenNotAuthenticated() throws Exception {
        // The security config requires authentication for /logout
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isUnauthorized());
    }
}
