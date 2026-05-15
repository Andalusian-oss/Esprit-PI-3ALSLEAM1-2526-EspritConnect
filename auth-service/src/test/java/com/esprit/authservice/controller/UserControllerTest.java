package com.esprit.authservice.controller;

import com.esprit.authservice.dto.request.UpdateUserRequestDTO;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web-layer slice tests for UserController — CRUD endpoints.
 *
 *  GET    /api/auth/users              (ADMIN only)
 *  GET    /api/auth/users/{id}
 *  PUT    /api/auth/users/{id}         (own profile, or any profile for ADMIN)
 *  DELETE /api/auth/users/{id}         (ADMIN only)
 *  GET    /api/auth/users/pending      (ADMIN only)
 *  PATCH  /api/auth/users/{id}/approve (ADMIN only)
 *  DELETE /api/auth/users/{id}/reject  (ADMIN only)
 *
 * No database is used — UserService is fully mocked.
 * Spring Security is loaded; @WithMockUser sets up auth for protected endpoints.
 *
 * Run with: mvn test -pl auth-service -Dtest=UserControllerTest  (when Maven is available)
 */
@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)   // loads real CSRF-disable + @EnableMethodSecurity
class UserControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    // ── Mocked dependencies ──────────────────────────────────────────────────
    @MockBean private UserService userService;
    // Required by SecurityConfig (loaded by @WebMvcTest)
    @MockBean private JwtAuthFilter jwtAuthFilter;
    @MockBean private UserDetailsServiceImpl userDetailsService;

    /**
     * Make the mocked JwtAuthFilter pass every request through the chain unchanged.
     * Without this, the mocked filter would silently drop all requests and the
     * controller would never be reached.
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

    private UserResponseDTO buildUser(Long id, String email, Role role) {
        return UserResponseDTO.builder()
                .id(id).email(email).prenom("Test").nom("User")
                .role(role).approved(true).online(false)
                .build();
    }

    // ════════════════════════════════════════════════════════════════════════
    //  GET /api/auth/users  — ADMIN only
    // ════════════════════════════════════════════════════════════════════════

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllUsers_returns200WithList_asAdmin() throws Exception {
        when(userService.getAllUsers()).thenReturn(List.of(
                buildUser(1L, "a@a.tn", Role.STUDENT),
                buildUser(2L, "b@b.tn", Role.ENSEIGNANT)
        ));

        mockMvc.perform(get("/api/auth/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].email").value("a@a.tn"))
                .andExpect(jsonPath("$[1].email").value("b@b.tn"));
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void getAllUsers_returns403_asNonAdmin() throws Exception {
        mockMvc.perform(get("/api/auth/users"))
                .andExpect(status().isForbidden());

        verify(userService, never()).getAllUsers();
    }

    // ════════════════════════════════════════════════════════════════════════
    //  GET /api/auth/users/{id}
    // ════════════════════════════════════════════════════════════════════════

    @Test
    @WithMockUser
    void getUserById_returns200() throws Exception {
        when(userService.getUserById(1L)).thenReturn(buildUser(1L, "a@a.tn", Role.STUDENT));

        mockMvc.perform(get("/api/auth/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("a@a.tn"))
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }

    @Test
    @WithMockUser
    void getUserById_returns404_whenNotFound() throws Exception {
        when(userService.getUserById(999L))
                .thenThrow(new com.esprit.authservice.exception.ResourceNotFoundException("User not found with id: 999"));

        mockMvc.perform(get("/api/auth/users/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found with id: 999"));
    }

    // ════════════════════════════════════════════════════════════════════════
    //  PUT /api/auth/users/{id}  — own profile or ADMIN for any profile
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void updateUser_returns200_whenUserUpdatesOwnProfile() throws Exception {
        UpdateUserRequestDTO body = new UpdateUserRequestDTO();
        body.setPrenom("Amine Updated");
        body.setSpecialite("Informatique");

        UserResponseDTO current = buildUser(1L, "amine@esprit.tn", Role.STUDENT);
        UserResponseDTO updated = UserResponseDTO.builder()
                .id(1L).email("amine@esprit.tn").prenom("Amine Updated")
                .nom("Ben Salem").role(Role.STUDENT).approved(true)
                .specialite("Informatique").build();

        when(userService.getUserByEmail("amine@esprit.tn")).thenReturn(current);
        when(userService.updateUser(eq(1L), any())).thenReturn(updated);

        mockMvc.perform(put("/api/auth/users/1")
                        .with(user("amine@esprit.tn").roles("STUDENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.prenom").value("Amine Updated"))
                .andExpect(jsonPath("$.specialite").value("Informatique"));
    }

    @Test
    void updateUser_returns403_whenStudentTriesToUpdateAnotherUser() throws Exception {
        UpdateUserRequestDTO body = new UpdateUserRequestDTO();
        body.setPrenom("Hacked");

        // User "amine@esprit.tn" (id=1) tries to update user id=2
        when(userService.getUserByEmail("amine@esprit.tn"))
                .thenReturn(buildUser(1L, "amine@esprit.tn", Role.STUDENT));

        mockMvc.perform(put("/api/auth/users/2")
                        .with(user("amine@esprit.tn").roles("STUDENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());

        verify(userService, never()).updateUser(anyLong(), any());
    }

    @Test
    void updateUser_returns200_whenAdminUpdatesAnyUser() throws Exception {
        UpdateUserRequestDTO body = new UpdateUserRequestDTO();
        body.setPrenom("Admin Updated");

        UserResponseDTO target = buildUser(5L, "student@esprit.tn", Role.STUDENT);
        UserResponseDTO updated = UserResponseDTO.builder()
                .id(5L).email("student@esprit.tn").prenom("Admin Updated")
                .nom("User").role(Role.STUDENT).approved(true).build();

        when(userService.getUserByEmail("admin@esprit.tn"))
                .thenReturn(buildUser(99L, "admin@esprit.tn", Role.ADMIN));
        when(userService.updateUser(eq(5L), any())).thenReturn(updated);

        mockMvc.perform(put("/api/auth/users/5")
                        .with(user("admin@esprit.tn").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.prenom").value("Admin Updated"));
    }

    @Test
    void updateUser_returns400_whenEmailFormatInvalid() throws Exception {
        UpdateUserRequestDTO body = new UpdateUserRequestDTO();
        body.setEmail("not-valid");

        when(userService.getUserByEmail("amine@esprit.tn"))
                .thenReturn(buildUser(1L, "amine@esprit.tn", Role.STUDENT));

        mockMvc.perform(put("/api/auth/users/1")
                        .with(user("amine@esprit.tn").roles("STUDENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").exists());
    }

    // ════════════════════════════════════════════════════════════════════════
    //  DELETE /api/auth/users/{id}  — ADMIN only
    // ════════════════════════════════════════════════════════════════════════

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteUser_returns204_asAdmin() throws Exception {
        doNothing().when(userService).deleteUser(1L);

        mockMvc.perform(delete("/api/auth/users/1"))
                .andExpect(status().isNoContent());

        verify(userService).deleteUser(1L);
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void deleteUser_returns403_asNonAdmin() throws Exception {
        mockMvc.perform(delete("/api/auth/users/1"))
                .andExpect(status().isForbidden());

        verify(userService, never()).deleteUser(anyLong());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteUser_returns404_whenUserNotFound() throws Exception {
        doThrow(new com.esprit.authservice.exception.ResourceNotFoundException("User not found with id: 999"))
                .when(userService).deleteUser(999L);

        mockMvc.perform(delete("/api/auth/users/999"))
                .andExpect(status().isNotFound());
    }

    // ════════════════════════════════════════════════════════════════════════
    //  GET /api/auth/users/pending  — ADMIN only
    // ════════════════════════════════════════════════════════════════════════

    @Test
    @WithMockUser(roles = "ADMIN")
    void getPendingCompanies_returns200WithList_asAdmin() throws Exception {
        UserResponseDTO pending = UserResponseDTO.builder()
                .id(2L).email("corp@co.tn").prenom("Corp SA").nom("Corp SA")
                .role(Role.COMPANY).approved(false).build();

        when(userService.getPendingCompanies()).thenReturn(List.of(pending));

        mockMvc.perform(get("/api/auth/users/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].approved").value(false))
                .andExpect(jsonPath("$[0].role").value("COMPANY"));
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void getPendingCompanies_returns403_asNonAdmin() throws Exception {
        mockMvc.perform(get("/api/auth/users/pending"))
                .andExpect(status().isForbidden());
    }

    // ════════════════════════════════════════════════════════════════════════
    //  PATCH /api/auth/users/{id}/approve  — ADMIN only
    // ════════════════════════════════════════════════════════════════════════

    @Test
    @WithMockUser(roles = "ADMIN")
    void approveUser_returns200WithApprovedTrue_asAdmin() throws Exception {
        UserResponseDTO approved = UserResponseDTO.builder()
                .id(2L).email("corp@co.tn").prenom("Corp SA").nom("Corp SA")
                .role(Role.COMPANY).approved(true).build();

        when(userService.approveUser(2L)).thenReturn(approved);

        mockMvc.perform(patch("/api/auth/users/2/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.approved").value(true))
                .andExpect(jsonPath("$.role").value("COMPANY"));
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void approveUser_returns403_asNonAdmin() throws Exception {
        mockMvc.perform(patch("/api/auth/users/2/approve"))
                .andExpect(status().isForbidden());

        verify(userService, never()).approveUser(anyLong());
    }

    // ════════════════════════════════════════════════════════════════════════
    //  DELETE /api/auth/users/{id}/reject  — ADMIN only
    // ════════════════════════════════════════════════════════════════════════

    @Test
    @WithMockUser(roles = "ADMIN")
    void rejectUser_returns204_asAdmin() throws Exception {
        doNothing().when(userService).rejectUser(2L);

        mockMvc.perform(delete("/api/auth/users/2/reject"))
                .andExpect(status().isNoContent());

        verify(userService).rejectUser(2L);
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void rejectUser_returns403_asNonAdmin() throws Exception {
        mockMvc.perform(delete("/api/auth/users/2/reject"))
                .andExpect(status().isForbidden());

        verify(userService, never()).rejectUser(anyLong());
    }
}
