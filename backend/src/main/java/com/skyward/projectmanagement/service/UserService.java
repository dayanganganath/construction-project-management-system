package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.dto.UserResponse;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.repository.UserProjectAssignmentRepository;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserProjectAssignmentRepository assignmentRepository;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            UserProjectAssignmentRepository assignmentRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.assignmentRepository = assignmentRepository;
    }

    public List<UserResponse> getAllUsers() {

        return userRepository
                .findAll()
                .stream()
                .map(user ->
                        new UserResponse(
                                user.getId(),
                                user.getUsername(),
                                user.getRole(),
                                user.getActive()
                        )
                )
                .toList();
    }

    public UserResponse createUser(User user) {

        if (
                userRepository
                        .findByUsername(
                                user.getUsername()
                        )
                        .isPresent()
        ) {
            throw new RuntimeException(
                    "Username already exists."
            );
        }

        if (
                user.getPassword() == null ||
                user.getPassword().isBlank()
        ) {
            throw new RuntimeException(
                    "Password is required."
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        if (
                user.getRole() == null ||
                user.getRole().isBlank()
        ) {
            user.setRole("CLIENT");
        }

        if (user.getActive() == null) {
            user.setActive(true);
        }

        User savedUser =
                userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getRole(),
                savedUser.getActive()
        );
    }

    public UserResponse updateUser(
            Long id,
            User updatedUser
    ) {

        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found."
                                )
                        );

        if (
                updatedUser.getUsername() == null ||
                updatedUser.getUsername().isBlank()
        ) {
            throw new RuntimeException(
                    "Username is required."
            );
        }

        if (
                !user.getUsername()
                        .equals(
                                updatedUser.getUsername()
                        )
                &&
                userRepository
                        .findByUsername(
                                updatedUser.getUsername()
                        )
                        .isPresent()
        ) {
            throw new RuntimeException(
                    "Username already exists."
            );
        }

        user.setUsername(
                updatedUser.getUsername()
        );

        if (
                updatedUser.getRole() != null &&
                !updatedUser.getRole().isBlank()
        ) {
            user.setRole(
                    updatedUser.getRole()
            );
        }

        if (
                updatedUser.getActive() != null
        ) {
            user.setActive(
                    updatedUser.getActive()
            );
        }

        if (
                updatedUser.getPassword() != null &&
                !updatedUser
                        .getPassword()
                        .isBlank()
        ) {
            user.setPassword(
                    passwordEncoder.encode(
                            updatedUser.getPassword()
                    )
            );
        }

        User savedUser =
                userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getRole(),
                savedUser.getActive()
        );
    }

    @Transactional
    public void deleteUser(Long id) {

        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found."
                                )
                        );

        var assignments =
                assignmentRepository
                        .findByUserId(id);

        assignmentRepository
                .deleteAll(assignments);

        userRepository.delete(user);
    }
}