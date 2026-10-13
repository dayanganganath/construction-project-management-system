package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.dto.UserResponse;
import com.skyward.projectmanagement.entity.Contractor;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.repository.ContractorRepository;
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
    private final ContractorRepository contractorRepository;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            UserProjectAssignmentRepository assignmentRepository,
            ContractorRepository contractorRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.assignmentRepository = assignmentRepository;
        this.contractorRepository = contractorRepository;
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

    @Transactional
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

        String newRole = user.getRole();

        if (
                updatedUser.getRole() != null &&
                !updatedUser.getRole().isBlank()
        ) {
            newRole = updatedUser.getRole();
        }

        /*
         * If this user is linked to a contractor
         * and role is changed away from CONTRACTOR,
         * unlink the contractor account first.
         */
        if (!"CONTRACTOR".equalsIgnoreCase(newRole)) {

            contractorRepository
                    .findByUserId(id)
                    .ifPresent(contractor -> {

                        contractor.setUser(null);

                        contractorRepository.save(
                                contractor
                        );
                    });
        }

        user.setUsername(
                updatedUser.getUsername()
        );

        user.setRole(
                newRole
        );

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

        /*
         * Remove CLIENT / SUPERVISOR
         * project assignments.
         */
        var assignments =
                assignmentRepository
                        .findByUserId(id);

        assignmentRepository
                .deleteAll(assignments);

        /*
         * If user is connected to a contractor,
         * unlink before deleting the user.
         *
         * This prevents foreign-key errors.
         */
        contractorRepository
                .findByUserId(id)
                .ifPresent(contractor -> {

                    contractor.setUser(null);

                    contractorRepository.save(
                            contractor
                    );
                });

        userRepository.delete(user);
    }
}