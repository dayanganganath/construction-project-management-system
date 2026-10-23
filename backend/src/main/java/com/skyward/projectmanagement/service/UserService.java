package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.dto.CreateClientInviteRequest;
import com.skyward.projectmanagement.dto.UserResponse;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.repository.ContractorRepository;
import com.skyward.projectmanagement.repository.UserProjectAssignmentRepository;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository
            userRepository;

    private final PasswordEncoder
            passwordEncoder;

    private final UserProjectAssignmentRepository
            assignmentRepository;

    private final ContractorRepository
            contractorRepository;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            UserProjectAssignmentRepository assignmentRepository,
            ContractorRepository contractorRepository
    ) {

        this.userRepository =
                userRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.assignmentRepository =
                assignmentRepository;

        this.contractorRepository =
                contractorRepository;
    }

    public List<UserResponse>
    getAllUsers() {

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

    /*
     * =========================================================
     * NORMAL USER CREATION
     * =========================================================
     */

    public UserResponse createUser(
            User user
    ) {

        validateUsername(
                user.getUsername(),
                null
        );

        if (
                user.getPassword() == null ||
                user.getPassword().isBlank()
        ) {
            throw new RuntimeException(
                    "Password is required."
            );
        }

        user.setUsername(
                user.getUsername().trim()
        );

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        if (
                user.getRole() == null ||
                user.getRole().isBlank()
        ) {
            user.setRole(
                    "CLIENT"
            );
        } else {
            user.setRole(
                    user.getRole()
                            .trim()
                            .toUpperCase()
            );
        }

        if (
                user.getActive() == null
        ) {
            user.setActive(true);
        }

        normalizeProfileFields(
                user
        );

        User savedUser =
                userRepository.save(
                        user
                );

        return toResponse(
                savedUser
        );
    }

    /*
     * =========================================================
     * CLIENT INVITE ACCOUNT
     * =========================================================
     *
     * Creates an inactive CLIENT account.
     *
     * The generated temporary password is random and never
     * returned to the admin or client. The client must activate
     * the account using the activation token before login.
     * =========================================================
     */

    @Transactional
    public User createInvitedClient(
            CreateClientInviteRequest request
    ) {

        if (request == null) {
            throw new RuntimeException(
                    "Client details are required."
            );
        }

        String username =
                request.getUsername() == null
                        ? ""
                        : request
                                .getUsername()
                                .trim();

        validateUsername(
                username,
                null
        );

        String fullName =
                trimToNull(
                        request.getFullName()
                );

        String email =
                trimToNull(
                        request.getEmail()
                );

        String phone =
                trimToNull(
                        request.getPhone()
                );

        if (fullName == null) {
            throw new RuntimeException(
                    "Client full name is required."
            );
        }

        if (fullName.length() > 150) {
            throw new RuntimeException(
                    "Full name must not exceed 150 characters."
            );
        }

        if (email == null) {
            throw new RuntimeException(
                    "Client email is required."
            );
        }

        if (
                email.length() > 190 ||
                !isValidEmail(email)
        ) {
            throw new RuntimeException(
                    "Please enter a valid email address."
            );
        }

        if (
                phone != null &&
                phone.length() > 50
        ) {
            throw new RuntimeException(
                    "Phone number must not exceed 50 characters."
            );
        }

        User user =
                new User();

        user.setUsername(
                username
        );

        /*
         * User.password is NOT NULL in the current model.
         *
         * Store an unknown random BCrypt value until the
         * activation process replaces it with the client's
         * chosen password.
         */
        String temporarySecret =
                UUID.randomUUID()
                        .toString()
                        + "-"
                        + UUID.randomUUID();

        user.setPassword(
                passwordEncoder.encode(
                        temporarySecret
                )
        );

        user.setRole(
                "CLIENT"
        );

        user.setActive(
                false
        );

        user.setFullName(
                fullName
        );

        user.setEmail(
                email
        );

        user.setPhone(
                phone
        );

        return userRepository.save(
                user
        );
    }

    /*
     * =========================================================
     * UPDATE USER
     * =========================================================
     */

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
                updatedUser
                        .getUsername()
                        .isBlank()
        ) {
            throw new RuntimeException(
                    "Username is required."
            );
        }

        String username =
                updatedUser
                        .getUsername()
                        .trim();

        validateUsername(
                username,
                id
        );

        String newRole =
                user.getRole();

        if (
                updatedUser.getRole() != null &&
                !updatedUser
                        .getRole()
                        .isBlank()
        ) {

            newRole =
                    updatedUser
                            .getRole()
                            .trim()
                            .toUpperCase();
        }

        /*
         * If this user is linked to a contractor
         * and role is changed away from CONTRACTOR,
         * unlink the contractor account first.
         */
        if (
                !"CONTRACTOR"
                        .equalsIgnoreCase(
                                newRole
                        )
        ) {

            contractorRepository
                    .findByUserId(id)
                    .ifPresent(
                            contractor -> {

                                contractor.setUser(
                                        null
                                );

                                contractorRepository
                                        .save(
                                                contractor
                                        );
                            }
                    );
        }

        user.setUsername(
                username
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
                            updatedUser
                                    .getPassword()
                    )
            );
        }

        if (
                updatedUser.getFullName() != null
        ) {
            user.setFullName(
                    trimToNull(
                            updatedUser
                                    .getFullName()
                    )
            );
        }

        if (
                updatedUser.getEmail() != null
        ) {

            String email =
                    trimToNull(
                            updatedUser
                                    .getEmail()
                    );

            if (
                    email != null &&
                    !isValidEmail(email)
            ) {
                throw new RuntimeException(
                        "Please enter a valid email address."
                );
            }

            user.setEmail(
                    email
            );
        }

        if (
                updatedUser.getPhone() != null
        ) {
            user.setPhone(
                    trimToNull(
                            updatedUser
                                    .getPhone()
                    )
            );
        }

        User savedUser =
                userRepository.save(
                        user
                );

        return toResponse(
                savedUser
        );
    }

    /*
     * =========================================================
     * DELETE USER
     * =========================================================
     */

    @Transactional
    public void deleteUser(
            Long id
    ) {

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
                .deleteAll(
                        assignments
                );

        contractorRepository
                .findByUserId(id)
                .ifPresent(
                        contractor -> {

                            contractor.setUser(
                                    null
                            );

                            contractorRepository
                                    .save(
                                            contractor
                                    );
                        }
                );

        userRepository.delete(
                user
        );
    }

    /*
     * =========================================================
     * HELPERS
     * =========================================================
     */

    private void validateUsername(
            String username,
            Long currentUserId
    ) {

        if (
                username == null ||
                username.isBlank()
        ) {
            throw new RuntimeException(
                    "Username is required."
            );
        }

        String normalized =
                username.trim();

        if (
                normalized.length() < 3
        ) {
            throw new RuntimeException(
                    "Username must contain at least 3 characters."
            );
        }

        if (
                normalized.length() > 100
        ) {
            throw new RuntimeException(
                    "Username must not exceed 100 characters."
            );
        }

        userRepository
                .findByUsername(
                        normalized
                )
                .ifPresent(
                        existingUser -> {

                            if (
                                    currentUserId == null ||
                                    !existingUser
                                            .getId()
                                            .equals(
                                                    currentUserId
                                            )
                            ) {
                                throw new RuntimeException(
                                        "Username already exists."
                                );
                            }
                        }
                );
    }

    private UserResponse toResponse(
            User user
    ) {

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getActive()
        );
    }

    private void normalizeProfileFields(
            User user
    ) {

        user.setFullName(
                trimToNull(
                        user.getFullName()
                )
        );

        user.setEmail(
                trimToNull(
                        user.getEmail()
                )
        );

        user.setPhone(
                trimToNull(
                        user.getPhone()
                )
        );
    }

    private String trimToNull(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String trimmed =
                value.trim();

        return trimmed.isEmpty()
                ? null
                : trimmed;
    }

    private boolean isValidEmail(
            String email
    ) {

        return email.matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
        );
    }
}