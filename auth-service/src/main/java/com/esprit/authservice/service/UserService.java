package com.esprit.authservice.service;

import com.esprit.authservice.dto.request.LoginRequestDTO;
import com.esprit.authservice.dto.request.RegisterRequestDTO;
import com.esprit.authservice.dto.request.UpdateUserRequestDTO;
import com.esprit.authservice.dto.response.AuthResponseDTO;
import com.esprit.authservice.dto.response.UserResponseDTO;

import java.util.List;

public interface UserService {
    AuthResponseDTO register(RegisterRequestDTO dto);
    AuthResponseDTO login(LoginRequestDTO dto);
    UserResponseDTO getUserById(Long id);
    UserResponseDTO getUserByEmail(String email);
    List<UserResponseDTO> getAllUsers();
    UserResponseDTO updateUser(Long id, UpdateUserRequestDTO dto);
    void deleteUser(Long id);
}
