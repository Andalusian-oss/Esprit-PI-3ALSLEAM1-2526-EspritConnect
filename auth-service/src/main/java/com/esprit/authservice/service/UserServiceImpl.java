package com.esprit.authservice.service;

import com.esprit.authservice.dto.request.LoginRequestDTO;
import com.esprit.authservice.dto.request.RegisterRequestDTO;
import com.esprit.authservice.dto.request.UpdateUserRequestDTO;
import com.esprit.authservice.dto.response.AuthResponseDTO;
import com.esprit.authservice.dto.response.UserResponseDTO;
import com.esprit.authservice.entity.EmailVerificationToken;
import com.esprit.authservice.entity.PasswordResetToken;
import com.esprit.authservice.repository.PasswordResetTokenRepository;
import com.esprit.authservice.entity.Role;
import com.esprit.authservice.entity.User;
import com.esprit.authservice.exception.ResourceNotFoundException;
import com.esprit.authservice.mapper.UserMapper;
import com.esprit.authservice.repository.EmailVerificationTokenRepository;
import com.esprit.authservice.repository.UserRepository;
import com.esprit.authservice.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Override
    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + dto.getEmail());
        }

        User user = userMapper.toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        if (dto.getRole() == Role.COMPANY) {
            // Companies self-register but require admin approval.
            if (dto.getVerificationDocumentUrl() == null || dto.getVerificationDocumentUrl().isBlank()) {
                throw new IllegalArgumentException("A verification document is required for company registration.");
            }
            // prenom holds the company name; nom is not collected — default it to the same value.
            if (user.getNom() == null || user.getNom().isBlank()) {
                user.setNom(user.getPrenom());
            }
            user.setRole(Role.COMPANY);
            user.setApproved(false);
        } else {
            // Use the role supplied by the client directly
            Role assignedRole = dto.getRole();
            if (assignedRole == Role.STUDENT || assignedRole == Role.ENSEIGNANT || assignedRole == Role.ALUMNI) {
                if (!dto.getEmail().toLowerCase().endsWith("@esprit.tn")) {
                    throw new IllegalArgumentException(
                            "Students, teachers, and alumni must register with an @esprit.tn email address.");
                }
            }
            user.setRole(assignedRole);
            user.setApproved(true);
        }

        User saved = userRepository.save(user);

        // Mark as unverified and send confirmation email
        saved.setEmailVerified(false);
        saved = userRepository.save(saved);

        String verificationToken = UUID.randomUUID().toString();
        tokenRepository.save(EmailVerificationToken.builder()
                .token(verificationToken)
                .user(saved)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build());

        emailService.sendVerificationEmail(saved.getEmail(), verificationToken);

        return AuthResponseDTO.builder()
                .user(userMapper.toResponseDTO(saved))
                .message("Registration successful! Please check your email to verify your account.")
                .build();
    }

    @Override
    @Transactional
    public AuthResponseDTO login(LoginRequestDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean passwordMatches = passwordEncoder.matches(dto.getPassword(), user.getPassword());

        if (!passwordMatches) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.isApproved()) {
            throw new BadCredentialsException("Account pending admin approval");
        }

        if (!user.isEmailVerified()) {
            throw new BadCredentialsException("EMAIL_NOT_VERIFIED");
        }

        user.setOnline(true);
        user.setLastLoginAt(LocalDateTime.now());
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userMapper.toResponseDTO(user))
                .build();
    }

    @Override
    @Transactional
    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setOnline(false);
            userRepository.save(user);
        });
    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toResponseDTO(user);
    }

    @Override
    public UserResponseDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return userMapper.toResponseDTO(user);
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponseDTO updateUser(Long id, UpdateUserRequestDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getPrenom() != null) user.setPrenom(dto.getPrenom());
        if (dto.getNom() != null) user.setNom(dto.getNom());
        // Role changes are handled only by the ADMIN — enforced in UserController
        if (dto.getRole() != null) user.setRole(dto.getRole());
        if (dto.getPromo() != null) user.setPromo(dto.getPromo());
        if (dto.getAvatarUrl() != null) user.setAvatarUrl(dto.getAvatarUrl());
        if (dto.getSpecialite() != null) user.setSpecialite(dto.getSpecialite());
        if (dto.getParcours() != null) user.setParcours(dto.getParcours());
        return userMapper.toResponseDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public List<UserResponseDTO> getPendingCompanies() {
        return userRepository.findByApprovedFalseAndRole(Role.COMPANY).stream()
                .map(userMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponseDTO approveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setApproved(true);
        return userMapper.toResponseDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public void rejectUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public List<UserResponseDTO> getOnlineUsers() {
        return userRepository.findByOnlineTrue().stream()
                .map(userMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDTO> searchUsers(String query) {
        return userRepository.findByPrenomContainingIgnoreCaseOrNomContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query, query)
                .stream()
                .map(userMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDTO> getUsersByIds(List<Long> ids) {
        return userRepository.findAllById(ids).stream()
                .map(userMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDTO> getDirectoryUsers(String role) {
        List<User> users;
        if (role != null && !role.isBlank()) {
            try {
                users = userRepository.findByApprovedTrueAndRole(Role.valueOf(role.toUpperCase()));
            } catch (IllegalArgumentException e) {
                users = userRepository.findByApprovedTrue();
            }
        } else {
            users = userRepository.findByApprovedTrue();
        }
        return users.stream().map(u -> UserResponseDTO.builder()
                .id(u.getId()).prenom(u.getPrenom()).nom(u.getNom())
                .role(u.getRole()).promo(u.getPromo()).avatarUrl(u.getAvatarUrl())
                .online(u.isOnline()).specialite(u.getSpecialite()).parcours(u.getParcours())
                .createdAt(u.getCreatedAt()).approved(u.isApproved()).build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public String verifyEmail(String token) {
        EmailVerificationToken vToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification token."));

        if (vToken.isUsed()) {
            throw new IllegalArgumentException("This verification link has already been used.");
        }
        if (vToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification link has expired. Please request a new one.");
        }

        User user = vToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        vToken.setUsed(true);
        tokenRepository.save(vToken);

        return "Your email has been verified successfully! You can now log in.";
    }

    @Override
    @Transactional
    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email: " + email));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("This account is already verified.");
        }

        // Delete old tokens for this user
        tokenRepository.deleteByUserId(user.getId());

        String newToken = UUID.randomUUID().toString();
        tokenRepository.save(EmailVerificationToken.builder()
                .token(newToken)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build());

        emailService.sendVerificationEmail(user.getEmail(), newToken);
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        // Always return without error to avoid user enumeration
        userRepository.findByEmail(email).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUserId(user.getId());

            String resetToken = UUID.randomUUID().toString();
            passwordResetTokenRepository.save(PasswordResetToken.builder()
                    .token(resetToken)
                    .user(user)
                    .expiresAt(LocalDateTime.now().plusHours(1))
                    .build());

            emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        });
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset link."));

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("This password reset link has already been used.");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This password reset link has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    @Override
    @Transactional
    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}

