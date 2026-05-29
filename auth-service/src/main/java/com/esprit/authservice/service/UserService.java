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
    void logout(String email);
    UserResponseDTO getUserById(Long id);
    UserResponseDTO getUserByEmail(String email);
    List<UserResponseDTO> getAllUsers();
    UserResponseDTO updateUser(Long id, UpdateUserRequestDTO dto);
    void deleteUser(Long id);
    List<UserResponseDTO> getPendingCompanies();
    UserResponseDTO approveUser(Long id);
    void rejectUser(Long id);
    List<UserResponseDTO> getOnlineUsers();
    List<UserResponseDTO> searchUsers(String query);
    List<UserResponseDTO> getUsersByIds(List<Long> ids);
    List<UserResponseDTO> getDirectoryUsers(String role);
    String verifyEmail(String token);
    void resendVerification(String email);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
    void changePassword(String email, String oldPassword, String newPassword);
}
