package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.dto.ChangePasswordRequest;
import com.skyward.projectmanagement.dto.ClientProfileDto;
import com.skyward.projectmanagement.dto.UpdateClientProfileRequest;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import java.util.Locale;
import java.util.UUID;

@Service
public class ClientProfileService {

    private static final long MAX_PROFILE_PHOTO_SIZE =
            5L * 1024L * 1024L;

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final Path profilePhotoDirectory;

    public ClientProfileService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        this.userRepository =
                userRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.profilePhotoDirectory =
                Paths.get(
                                "uploads",
                                "profile-photos"
                        )
                        .toAbsolutePath()
                        .normalize();
    }

    /*
     * =========================================================
     * PROFILE
     * =========================================================
     */

    public ClientProfileDto getProfile(
            String username
    ) {

        User user =
                getClientUser(
                        username
                );

        return toDto(user);
    }

    public ClientProfileDto updateProfile(
            String username,
            UpdateClientProfileRequest request
    ) {

        User user =
                getClientUser(
                        username
                );

        if (request == null) {
            throw new RuntimeException(
                    "Profile information is required."
            );
        }

        String fullName =
                cleanValue(
                        request.getFullName()
                );

        String email =
                cleanValue(
                        request.getEmail()
                );

        String phone =
                cleanValue(
                        request.getPhone()
                );

        if (
                fullName != null &&
                fullName.length() > 150
        ) {
            throw new RuntimeException(
                    "Full name is too long."
            );
        }

        if (
                email != null &&
                email.length() > 190
        ) {
            throw new RuntimeException(
                    "Email is too long."
            );
        }

        if (
                email != null &&
                !email.matches(
                        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$"
                )
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
                    "Phone number is too long."
            );
        }

        user.setFullName(
                fullName
        );

        user.setEmail(
                email
        );

        user.setPhone(
                phone
        );

        User saved =
                userRepository.save(
                        user
                );

        return toDto(saved);
    }

    /*
     * =========================================================
     * PROFILE PHOTO
     * =========================================================
     */

    public ClientProfileDto uploadProfilePhoto(
            String username,
            MultipartFile file
    ) {

        User user =
                getClientUser(
                        username
                );

        if (
                file == null ||
                file.isEmpty()
        ) {
            throw new RuntimeException(
                    "Please select a profile photo."
            );
        }

        if (
                file.getSize() >
                MAX_PROFILE_PHOTO_SIZE
        ) {
            throw new RuntimeException(
                    "Profile photo must be 5 MB or smaller."
            );
        }

        String contentType =
                file.getContentType();

        if (
                contentType == null ||
                !isAllowedImageType(
                        contentType
                )
        ) {
            throw new RuntimeException(
                    "Only JPG, PNG and WEBP images are allowed."
            );
        }

        try {

            Files.createDirectories(
                    profilePhotoDirectory
            );

            String extension =
                    getSafeExtension(
                            contentType
                    );

            String fileName =
                    "client-" +
                    user.getId() +
                    "-" +
                    UUID.randomUUID() +
                    extension;

            Path destination =
                    profilePhotoDirectory
                            .resolve(
                                    fileName
                            )
                            .normalize();

            if (
                    !destination.startsWith(
                            profilePhotoDirectory
                    )
            ) {
                throw new RuntimeException(
                        "Invalid profile photo path."
                );
            }

            /*
             * Delete previous profile photo.
             */
            deleteExistingPhoto(
                    user
            );

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

            user.setProfilePhotoPath(
                    destination.toString()
            );

            user.setProfilePhotoContentType(
                    contentType
            );

            User saved =
                    userRepository.save(
                            user
                    );

            return toDto(saved);

        } catch (RuntimeException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to save profile photo.",
                    e
            );
        }
    }

    public Resource getProfilePhoto(
            String username
    ) {

        User user =
                getClientUser(
                        username
                );

        if (
                user.getProfilePhotoPath() == null ||
                user.getProfilePhotoPath().isBlank()
        ) {
            throw new RuntimeException(
                    "Profile photo not found."
            );
        }

        try {

            Path path =
                    Paths.get(
                                    user.getProfilePhotoPath()
                            )
                            .toAbsolutePath()
                            .normalize();

            if (
                    !path.startsWith(
                            profilePhotoDirectory
                    )
            ) {
                throw new RuntimeException(
                        "Invalid profile photo path."
                );
            }

            Resource resource =
                    new UrlResource(
                            path.toUri()
                    );

            if (
                    !resource.exists() ||
                    !resource.isReadable()
            ) {
                throw new RuntimeException(
                        "Profile photo file not found."
                );
            }

            return resource;

        } catch (RuntimeException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to load profile photo.",
                    e
            );
        }
    }

    public String getProfilePhotoContentType(
            String username
    ) {

        User user =
                getClientUser(
                        username
                );

        String contentType =
                user.getProfilePhotoContentType();

        if (
                contentType == null ||
                contentType.isBlank()
        ) {
            return "application/octet-stream";
        }

        return contentType;
    }

    public ClientProfileDto deleteProfilePhoto(
            String username
    ) {

        User user =
                getClientUser(
                        username
                );

        deleteExistingPhoto(
                user
        );

        user.setProfilePhotoPath(
                null
        );

        user.setProfilePhotoContentType(
                null
        );

        User saved =
                userRepository.save(
                        user
                );

        return toDto(saved);
    }

    /*
     * =========================================================
     * PASSWORD
     * =========================================================
     */

    public void changePassword(
            String username,
            ChangePasswordRequest request
    ) {

        User user =
                getClientUser(
                        username
                );

        if (request == null) {
            throw new RuntimeException(
                    "Password information is required."
            );
        }

        String currentPassword =
                request.getCurrentPassword();

        String newPassword =
                request.getNewPassword();

        String confirmPassword =
                request.getConfirmPassword();

        if (
                currentPassword == null ||
                currentPassword.isBlank()
        ) {
            throw new RuntimeException(
                    "Current password is required."
            );
        }

        if (
                newPassword == null ||
                newPassword.isBlank()
        ) {
            throw new RuntimeException(
                    "New password is required."
            );
        }

        if (
                newPassword.length() < 8
        ) {
            throw new RuntimeException(
                    "New password must contain at least 8 characters."
            );
        }

        if (
                !newPassword.equals(
                        confirmPassword
                )
        ) {
            throw new RuntimeException(
                    "New password and confirmation do not match."
            );
        }

        if (
                !passwordEncoder.matches(
                        currentPassword,
                        user.getPassword()
                )
        ) {
            throw new RuntimeException(
                    "Current password is incorrect."
            );
        }

        if (
                passwordEncoder.matches(
                        newPassword,
                        user.getPassword()
                )
        ) {
            throw new RuntimeException(
                    "New password must be different from the current password."
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );

        userRepository.save(
                user
        );
    }

    /*
     * =========================================================
     * SECURITY
     * =========================================================
     */

    private User getClientUser(
            String username
    ) {

        User user =
                userRepository
                        .findByUsername(
                                username
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Logged-in user not found."
                                )
                        );

        if (
                !Boolean.TRUE.equals(
                        user.getActive()
                )
        ) {
            throw new RuntimeException(
                    "User account is inactive."
            );
        }

        if (
                !"CLIENT".equalsIgnoreCase(
                        user.getRole()
                )
        ) {
            throw new RuntimeException(
                    "Client profile is only available for CLIENT users."
            );
        }

        return user;
    }

    /*
     * =========================================================
     * HELPERS
     * =========================================================
     */

    private ClientProfileDto toDto(
            User user
    ) {

        boolean photoAvailable =
                user.getProfilePhotoPath() != null &&
                !user.getProfilePhotoPath().isBlank();

        return new ClientProfileDto(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                photoAvailable
        );
    }

    private String cleanValue(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String cleaned =
                value.trim();

        return cleaned.isBlank()
                ? null
                : cleaned;
    }

    private boolean isAllowedImageType(
            String contentType
    ) {

        String type =
                contentType
                        .toLowerCase(
                                Locale.ROOT
                        );

        return type.equals(
                        "image/jpeg"
                ) ||
                type.equals(
                        "image/png"
                ) ||
                type.equals(
                        "image/webp"
                );
    }

    private String getSafeExtension(
            String contentType
    ) {

        return switch (
                contentType
                        .toLowerCase(
                                Locale.ROOT
                        )
        ) {

            case "image/png" ->
                    ".png";

            case "image/webp" ->
                    ".webp";

            default ->
                    ".jpg";
        };
    }

    private void deleteExistingPhoto(
            User user
    ) {

        if (
                user.getProfilePhotoPath() == null ||
                user.getProfilePhotoPath().isBlank()
        ) {
            return;
        }

        try {

            Path existing =
                    Paths.get(
                                    user.getProfilePhotoPath()
                            )
                            .toAbsolutePath()
                            .normalize();

            if (
                    existing.startsWith(
                            profilePhotoDirectory
                    )
            ) {
                Files.deleteIfExists(
                        existing
                );
            }

        } catch (Exception e) {

            /*
             * Do not block profile update if an old
             * local file can no longer be found.
             */
            System.err.println(
                    "Unable to delete old profile photo: " +
                    e.getMessage()
            );
        }
    }
}