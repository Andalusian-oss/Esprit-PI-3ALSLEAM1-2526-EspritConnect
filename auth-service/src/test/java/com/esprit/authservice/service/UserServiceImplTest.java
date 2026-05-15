package com.esprit.authservice.service;

import com.esprit.authservice.dto.request.LoginRequestDTO;
import com.esprit.authservice.dto.request.RegisterRequestDTO;
import com.esprit.authservice.dto.request.UpdateUserRequestDTO;
import com.esprit.authservice.dto.response.AuthResponseDTO;
import com.esprit.authservice.dto.response.UserResponseDTO;
import com.esprit.authservice.entity.EspritReference;
import com.esprit.authservice.entity.Role;
import com.esprit.authservice.entity.User;
import com.esprit.authservice.exception.ResourceNotFoundException;
import com.esprit.authservice.mapper.UserMapper;
import com.esprit.authservice.repository.EspritReferenceRepository;
import com.esprit.authservice.repository.UserRepository;
import com.esprit.authservice.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Pure unit tests for UserServiceImpl.
 *
 * No Spring context, no database, no Maven plugins required.
 * Run with: mvn test -pl auth-service   (when Maven is available)
 */
@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private EspritReferenceRepository espritReferenceRepository;
    @Mock private UserMapper userMapper;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks
    private UserServiceImpl userService;

    // ── Shared test fixtures ─────────────────────────────────────────────────

    private RegisterRequestDTO studentDto() {
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

    private RegisterRequestDTO companyDto() {
        RegisterRequestDTO dto = new RegisterRequestDTO();
        dto.setEmail("acme@company.tn");
        dto.setPassword("pass123");
        dto.setPrenom("Acme Corp");
        dto.setNom("Acme Corp");
        dto.setRole(Role.COMPANY);
        return dto;
    }

    private User studentUser() {
        return User.builder()
                .id(1L)
                .email("amine@esprit.tn")
                .password("$2a$10$encoded")
                .prenom("Amine")
                .nom("Ben Salem")
                .role(Role.STUDENT)
                .approved(true)
                .online(false)
                .build();
    }

    private UserResponseDTO studentResponseDto() {
        return UserResponseDTO.builder()
                .id(1L)
                .email("amine@esprit.tn")
                .prenom("Amine")
                .nom("Ben Salem")
                .role(Role.STUDENT)
                .approved(true)
                .online(false)
                .build();
    }

    private EspritReference espritRef() {
        return EspritReference.builder()
                .id(1L)
                .espritId("ESP-2024-001")
                .cin("12345678")
                .expectedRole(Role.STUDENT)
                .nom("Ben Salem")
                .prenom("Amine")
                .build();
    }

    // ════════════════════════════════════════════════════════════════════════
    //  REGISTER
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void register_student_returnsTokenAndUser() {
        RegisterRequestDTO dto = studentDto();
        User user = studentUser();

        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(userMapper.toEntity(dto)).thenReturn(user);
        when(passwordEncoder.encode(dto.getPassword())).thenReturn("$2a$10$encoded");
        when(espritReferenceRepository.findByEspritIdAndCin("ESP-2024-001", "12345678"))
                .thenReturn(Optional.of(espritRef()));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userMapper.toResponseDTO(user)).thenReturn(studentResponseDto());
        when(jwtUtil.generateToken(anyString(), anyLong(), anyString())).thenReturn("jwt-token");

        AuthResponseDTO result = userService.register(dto);

        assertThat(result.getToken()).isEqualTo("jwt-token");
        assertThat(result.getTokenType()).isEqualTo("Bearer");
        assertThat(result.getUser().getEmail()).isEqualTo("amine@esprit.tn");
        // Role must be taken from the reference table, not from the client payload
        verify(espritReferenceRepository).findByEspritIdAndCin("ESP-2024-001", "12345678");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_throws_whenEmailAlreadyUsed() {
        RegisterRequestDTO dto = studentDto();
        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> userService.register(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already in use");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_throws_whenEspritIdIsBlank() {
        RegisterRequestDTO dto = studentDto();
        dto.setEspritId("   "); // blank

        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(userMapper.toEntity(dto)).thenReturn(studentUser());
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encoded");

        assertThatThrownBy(() -> userService.register(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Esprit ID and CIN are required");
    }

    @Test
    void register_throws_whenCinIsNull() {
        RegisterRequestDTO dto = studentDto();
        dto.setCin(null);

        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(userMapper.toEntity(dto)).thenReturn(studentUser());
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encoded");

        assertThatThrownBy(() -> userService.register(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Esprit ID and CIN are required");
    }

    @Test
    void register_throws_whenEspritIdCinNotInReferenceTable() {
        RegisterRequestDTO dto = studentDto();

        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(userMapper.toEntity(dto)).thenReturn(studentUser());
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encoded");
        when(espritReferenceRepository.findByEspritIdAndCin(anyString(), anyString()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.register(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Esprit ID / CIN combination not found");
    }

    @Test
    void register_company_setsApprovedFalseAndSkipsReferenceCheck() {
        RegisterRequestDTO dto = companyDto();
        User companyUser = User.builder()
                .id(2L).email("acme@company.tn").password("$enc$")
                .prenom("Acme Corp").nom("Acme Corp")
                .role(Role.COMPANY).approved(false).online(false)
                .build();
        UserResponseDTO companyDto2 = UserResponseDTO.builder()
                .id(2L).email("acme@company.tn").role(Role.COMPANY).approved(false).build();

        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(userMapper.toEntity(dto)).thenReturn(companyUser);
        when(passwordEncoder.encode(anyString())).thenReturn("$enc$");
        when(userRepository.save(any(User.class))).thenReturn(companyUser);
        when(userMapper.toResponseDTO(companyUser)).thenReturn(companyDto2);
        when(jwtUtil.generateToken(anyString(), anyLong(), anyString())).thenReturn("jwt");

        AuthResponseDTO result = userService.register(dto);

        assertThat(result.getUser().isApproved()).isFalse();
        // Companies must NOT be verified against the reference table
        verify(espritReferenceRepository, never()).findByEspritIdAndCin(anyString(), anyString());
        // approved must be explicitly set to false before saving
        verify(userRepository).save(argThat(u -> !u.isApproved()));
    }

    // ════════════════════════════════════════════════════════════════════════
    //  LOGIN
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void login_success_returnsTokenAndSetsOnline() {
        LoginRequestDTO dto = new LoginRequestDTO();
        dto.setEmail("amine@esprit.tn");
        dto.setPassword("secret123");

        User user = studentUser();

        when(userRepository.findByEmail(dto.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(dto.getPassword(), user.getPassword())).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userMapper.toResponseDTO(user)).thenReturn(studentResponseDto());
        when(jwtUtil.generateToken(anyString(), anyLong(), anyString())).thenReturn("jwt-token");

        AuthResponseDTO result = userService.login(dto);

        assertThat(result.getToken()).isEqualTo("jwt-token");
        // The user must have been saved with online = true and lastLoginAt set
        verify(userRepository).save(argThat(u -> u.isOnline() && u.getLastLoginAt() != null));
    }

    @Test
    void login_throws_whenUserNotFound() {
        LoginRequestDTO dto = new LoginRequestDTO();
        dto.setEmail("ghost@esprit.tn");
        dto.setPassword("x");

        when(userRepository.findByEmail(dto.getEmail())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.login(dto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void login_throws_whenPasswordWrong() {
        LoginRequestDTO dto = new LoginRequestDTO();
        dto.setEmail("amine@esprit.tn");
        dto.setPassword("wrongpass");

        User user = studentUser(); // password = "$2a$10$encoded", not equal to "wrongpass"

        when(userRepository.findByEmail(dto.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(dto.getPassword(), user.getPassword())).thenReturn(false);

        assertThatThrownBy(() -> userService.login(dto))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid email or password");

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_throws_whenAccountPendingApproval() {
        LoginRequestDTO dto = new LoginRequestDTO();
        dto.setEmail("acme@company.tn");
        dto.setPassword("pass123");

        User pendingCompany = User.builder()
                .id(2L).email("acme@company.tn").password("$enc$")
                .role(Role.COMPANY).approved(false).online(false)
                .prenom("Acme Corp").nom("Acme Corp")
                .build();

        when(userRepository.findByEmail(dto.getEmail())).thenReturn(Optional.of(pendingCompany));
        when(passwordEncoder.matches(dto.getPassword(), pendingCompany.getPassword())).thenReturn(true);

        assertThatThrownBy(() -> userService.login(dto))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("pending admin approval");
    }

    // ════════════════════════════════════════════════════════════════════════
    //  LOGOUT
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void logout_setsUserOffline() {
        User user = studentUser();
        user.setOnline(true);

        when(userRepository.findByEmail("amine@esprit.tn")).thenReturn(Optional.of(user));

        userService.logout("amine@esprit.tn");

        verify(userRepository).save(argThat(u -> !u.isOnline()));
    }

    @Test
    void logout_doesNothing_whenUserEmailUnknown() {
        when(userRepository.findByEmail("ghost@esprit.tn")).thenReturn(Optional.empty());

        // Must not throw even if user does not exist
        assertThatNoException().isThrownBy(() -> userService.logout("ghost@esprit.tn"));
        verify(userRepository, never()).save(any());
    }

    // ════════════════════════════════════════════════════════════════════════
    //  CRUD  —  READ
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void getUserById_returnsCorrectDto() {
        User user = studentUser();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.toResponseDTO(user)).thenReturn(studentResponseDto());

        UserResponseDTO result = userService.getUserById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo("amine@esprit.tn");
    }

    @Test
    void getUserById_throws_whenNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void getUserByEmail_returnsCorrectDto() {
        User user = studentUser();
        when(userRepository.findByEmail("amine@esprit.tn")).thenReturn(Optional.of(user));
        when(userMapper.toResponseDTO(user)).thenReturn(studentResponseDto());

        UserResponseDTO result = userService.getUserByEmail("amine@esprit.tn");

        assertThat(result.getEmail()).isEqualTo("amine@esprit.tn");
    }

    @Test
    void getUserByEmail_throws_whenNotFound() {
        when(userRepository.findByEmail("ghost@esprit.tn")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserByEmail("ghost@esprit.tn"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getAllUsers_returnsAllMappedDtos() {
        User u1 = studentUser();
        User u2 = User.builder().id(2L).email("prof@esprit.tn").prenom("Sami").nom("Trabelsi")
                .role(Role.ENSEIGNANT).approved(true).online(false).build();
        UserResponseDTO dto2 = UserResponseDTO.builder()
                .id(2L).email("prof@esprit.tn").role(Role.ENSEIGNANT).approved(true).build();

        when(userRepository.findAll()).thenReturn(List.of(u1, u2));
        when(userMapper.toResponseDTO(u1)).thenReturn(studentResponseDto());
        when(userMapper.toResponseDTO(u2)).thenReturn(dto2);

        List<UserResponseDTO> result = userService.getAllUsers();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(UserResponseDTO::getEmail)
                .containsExactlyInAnyOrder("amine@esprit.tn", "prof@esprit.tn");
    }

    // ════════════════════════════════════════════════════════════════════════
    //  CRUD  —  UPDATE
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void updateUser_updatesOnlyNonNullFields() {
        UpdateUserRequestDTO dto = new UpdateUserRequestDTO();
        dto.setPrenom("Amine Updated");
        dto.setSpecialite("Informatique");

        User user = studentUser();
        UserResponseDTO updatedDto = UserResponseDTO.builder()
                .id(1L).email("amine@esprit.tn").prenom("Amine Updated")
                .specialite("Informatique").role(Role.STUDENT).approved(true).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userMapper.toResponseDTO(user)).thenReturn(updatedDto);

        UserResponseDTO result = userService.updateUser(1L, dto);

        assertThat(result.getPrenom()).isEqualTo("Amine Updated");
        assertThat(result.getSpecialite()).isEqualTo("Informatique");
        verify(userRepository).save(argThat(u ->
                "Amine Updated".equals(u.getPrenom()) && "Informatique".equals(u.getSpecialite())));
    }

    @Test
    void updateUser_throws_whenUserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateUser(999L, new UpdateUserRequestDTO()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ════════════════════════════════════════════════════════════════════════
    //  CRUD  —  DELETE
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void deleteUser_callsRepositoryDeleteById() {
        when(userRepository.existsById(1L)).thenReturn(true);

        userService.deleteUser(1L);

        verify(userRepository).deleteById(1L);
    }

    @Test
    void deleteUser_throws_whenUserNotFound() {
        when(userRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> userService.deleteUser(999L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(userRepository, never()).deleteById(any());
    }

    // ════════════════════════════════════════════════════════════════════════
    //  COMPANY APPROVAL WORKFLOW
    // ════════════════════════════════════════════════════════════════════════

    @Test
    void getPendingCompanies_returnsOnlyPendingCompanies() {
        User pending = User.builder().id(2L).email("corp@co.tn").prenom("Corp").nom("Corp")
                .role(Role.COMPANY).approved(false).online(false).build();
        UserResponseDTO pendingDto = UserResponseDTO.builder()
                .id(2L).email("corp@co.tn").role(Role.COMPANY).approved(false).build();

        when(userRepository.findByApprovedFalseAndRole(Role.COMPANY)).thenReturn(List.of(pending));
        when(userMapper.toResponseDTO(pending)).thenReturn(pendingDto);

        List<UserResponseDTO> result = userService.getPendingCompanies();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isApproved()).isFalse();
        assertThat(result.get(0).getRole()).isEqualTo(Role.COMPANY);
    }

    @Test
    void approveUser_setsApprovedTrueAndPersists() {
        User pending = User.builder().id(2L).email("corp@co.tn").prenom("Corp").nom("Corp")
                .role(Role.COMPANY).approved(false).online(false).build();
        User approvedUser = User.builder().id(2L).email("corp@co.tn").prenom("Corp").nom("Corp")
                .role(Role.COMPANY).approved(true).online(false).build();
        UserResponseDTO approvedDto = UserResponseDTO.builder()
                .id(2L).email("corp@co.tn").role(Role.COMPANY).approved(true).build();

        when(userRepository.findById(2L)).thenReturn(Optional.of(pending));
        when(userRepository.save(any(User.class))).thenReturn(approvedUser);
        when(userMapper.toResponseDTO(approvedUser)).thenReturn(approvedDto);

        UserResponseDTO result = userService.approveUser(2L);

        assertThat(result.isApproved()).isTrue();
        verify(userRepository).save(argThat(User::isApproved));
    }

    @Test
    void approveUser_throws_whenUserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.approveUser(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void rejectUser_deletesUser() {
        when(userRepository.existsById(2L)).thenReturn(true);

        userService.rejectUser(2L);

        verify(userRepository).deleteById(2L);
    }

    @Test
    void rejectUser_throws_whenUserNotFound() {
        when(userRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> userService.rejectUser(999L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(userRepository, never()).deleteById(any());
    }
}
