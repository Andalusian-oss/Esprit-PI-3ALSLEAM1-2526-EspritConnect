package com.esprit.authservice.repository;

import com.esprit.authservice.entity.Role;
import com.esprit.authservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByApprovedFalseAndRole(Role role);
    List<User> findByApprovedTrue();
    List<User> findByApprovedTrueAndRole(Role role);
    List<User> findByOnlineTrue();
    List<User> findByPrenomContainingIgnoreCaseOrNomContainingIgnoreCaseOrEmailContainingIgnoreCase(String prenom, String nom, String email);
}
