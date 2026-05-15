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
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EspritReferenceRepository espritReferenceRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

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
            // prenom holds the company name; nom is not collected — default it to the same value.
            if (user.getNom() == null || user.getNom().isBlank()) {
                user.setNom(user.getPrenom());
            }
            user.setRole(Role.COMPANY);
            user.setApproved(false);
        } else {
            // All other roles: verify espritId + CIN against the reference table
            if (dto.getEspritId() == null || dto.getEspritId().isBlank()
                    || dto.getCin() == null || dto.getCin().isBlank()) {
                throw new IllegalArgumentException("Esprit ID and CIN are required for non-company accounts");
            }
            EspritReference ref = espritReferenceRepository
                    .findByEspritIdAndCin(dto.getEspritId(), dto.getCin())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Esprit ID / CIN combination not found. Contact the administration."));
            // Role is auto-assigned from the reference table; ignore whatever the client sent
            user.setRole(ref.getExpectedRole());
            user.setApproved(true);
        }

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getId(), saved.getRole().name());
        return AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userMapper.toResponseDTO(saved))
                .build();
    }

    @Override
    @Transactional
    public AuthResponseDTO login(LoginRequestDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean passwordMatches = passwordEncoder.matches(dto.getPassword(), user.getPassword());
        boolean legacyPlaintextMatch = dto.getPassword().equals(user.getPassword());

        if (!passwordMatches && !legacyPlaintextMatch) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!passwordMatches && legacyPlaintextMatch) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        if (!user.isApproved()) {
            throw new BadCredentialsException("Account pending admin approval");
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
}

