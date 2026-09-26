package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.dto.UserResponse;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getRole(),
                        user.getActive()
                ))
                .toList();
    }

    public UserResponse createUser(User user) {

        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists.");
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }

        if (user.getActive() == null) {
            user.setActive(true);
        }

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getRole(),
                savedUser.getActive()
        );
    }

    public UserResponse updateUser(Long id, User updatedUser) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found.")
                );

        if (
                !user.getUsername().equals(updatedUser.getUsername()) &&
                userRepository.findByUsername(updatedUser.getUsername()).isPresent()
        ) {
            throw new RuntimeException("Username already exists.");
        }

        user.setUsername(updatedUser.getUsername());
        user.setRole(updatedUser.getRole());
        user.setActive(updatedUser.getActive());

        if (
                updatedUser.getPassword() != null &&
                !updatedUser.getPassword().isBlank()
        ) {
            user.setPassword(
                    passwordEncoder.encode(updatedUser.getPassword())
            );
        }

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getRole(),
                savedUser.getActive()
        );
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}