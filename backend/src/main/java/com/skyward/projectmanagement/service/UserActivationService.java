package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.dto.ActivationInviteResponse;
import com.skyward.projectmanagement.dto.ActivateAccountRequest;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.entity.UserActivationToken;
import com.skyward.projectmanagement.repository.UserActivationTokenRepository;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

import java.time.LocalDateTime;

import java.util.Base64;
import java.util.HexFormat;
import java.util.List;

@Service
public class UserActivationService {

    private static final int TOKEN_BYTES =
            32;

    private static final int EXPIRY_HOURS =
            24;

    private final UserRepository userRepository;

    private final UserActivationTokenRepository
            activationTokenRepository;

    private final PasswordEncoder
            passwordEncoder;

    private final SecureRandom secureRandom =
            new SecureRandom();

    public UserActivationService(
            UserRepository userRepository,
            UserActivationTokenRepository activationTokenRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository =
                userRepository;

        this.activationTokenRepository =
                activationTokenRepository;

        this.passwordEncoder =
                passwordEncoder;
    }

    @Transactional
    public ActivationInviteResponse
    createActivationInvite(
            Long userId,
            String createdBy
    ) {

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found."
                                )
                        );

        if (
                !"CLIENT".equalsIgnoreCase(
                        user.getRole()
                )
        ) {
            throw new RuntimeException(
                    "Activation invitations can only be created for CLIENT users."
            );
        }

        invalidateExistingTokens(
                user.getId()
        );

        String rawToken =
                generateSecureToken();

        UserActivationToken
                activationToken =
                new UserActivationToken();

        activationToken.setUser(
                user
        );

        activationToken.setTokenHash(
                hashToken(
                        rawToken
                )
        );

        activationToken.setExpiresAt(
                LocalDateTime.now()
                        .plusHours(
                                EXPIRY_HOURS
                        )
        );

        activationToken.setCreatedAt(
                LocalDateTime.now()
        );

        activationToken.setCreatedBy(
                createdBy
        );

        activationTokenRepository.save(
                activationToken
        );

        /*
         * Client must activate the account
         * before normal login is allowed.
         */
        user.setActive(false);

        userRepository.save(user);

        return new ActivationInviteResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                rawToken,
                activationToken
                        .getExpiresAt()
        );
    }

    @Transactional(readOnly = true)
    public void validateToken(
            String rawToken
    ) {

        getValidToken(
                rawToken
        );
    }

    @Transactional
    public void activateAccount(
            ActivateAccountRequest request
    ) {

        validateActivationRequest(
                request
        );

        UserActivationToken
                activationToken =
                getValidToken(
                        request.getToken()
                );

        User user =
                activationToken.getUser();

        if (
                !"CLIENT".equalsIgnoreCase(
                        user.getRole()
                )
        ) {
            throw new RuntimeException(
                    "This activation token is not valid for a client account."
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request
                                .getNewPassword()
                )
        );

        user.setActive(true);

        userRepository.save(user);

        activationToken.setUsedAt(
                LocalDateTime.now()
        );

        activationTokenRepository.save(
                activationToken
        );

        invalidateExistingTokens(
                user.getId()
        );
    }

    private void validateActivationRequest(
            ActivateAccountRequest request
    ) {

        if (
                request == null ||
                request.getToken() == null ||
                request.getToken()
                        .isBlank()
        ) {
            throw new RuntimeException(
                    "Activation token is required."
            );
        }

        if (
                request.getNewPassword()
                        == null ||
                request.getNewPassword()
                        .isBlank()
        ) {
            throw new RuntimeException(
                    "New password is required."
            );
        }

        if (
                request.getNewPassword()
                        .length() < 8
        ) {
            throw new RuntimeException(
                    "Password must contain at least 8 characters."
            );
        }

        if (
                request.getConfirmPassword()
                        == null ||
                !request
                        .getNewPassword()
                        .equals(
                                request
                                        .getConfirmPassword()
                        )
        ) {
            throw new RuntimeException(
                    "Password confirmation does not match."
            );
        }
    }

    private UserActivationToken
    getValidToken(
            String rawToken
    ) {

        if (
                rawToken == null ||
                rawToken.isBlank()
        ) {
            throw new RuntimeException(
                    "Activation token is required."
            );
        }

        String tokenHash =
                hashToken(
                        rawToken.trim()
                );

        UserActivationToken token =
                activationTokenRepository
                        .findByTokenHash(
                                tokenHash
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid activation token."
                                )
                        );

        if (token.isUsed()) {
            throw new RuntimeException(
                    "This activation token has already been used."
            );
        }

        if (token.isExpired()) {
            throw new RuntimeException(
                    "This activation token has expired."
            );
        }

        return token;
    }

    private void invalidateExistingTokens(
            Long userId
    ) {

        List<UserActivationToken>
                existingTokens =
                activationTokenRepository
                        .findByUserIdAndUsedAtIsNull(
                                userId
                        );

        LocalDateTime now =
                LocalDateTime.now();

        for (
                UserActivationToken token
                : existingTokens
        ) {

            token.setUsedAt(now);
        }

        activationTokenRepository
                .saveAll(
                        existingTokens
                );
    }

    private String generateSecureToken() {

        byte[] bytes =
                new byte[
                        TOKEN_BYTES
                ];

        secureRandom.nextBytes(
                bytes
        );

        return Base64
                .getUrlEncoder()
                .withoutPadding()
                .encodeToString(
                        bytes
                );
    }

    private String hashToken(
            String token
    ) {

        try {

            MessageDigest digest =
                    MessageDigest
                            .getInstance(
                                    "SHA-256"
                            );

            byte[] hash =
                    digest.digest(
                            token.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return HexFormat
                    .of()
                    .formatHex(
                            hash
                    );

        } catch (
                NoSuchAlgorithmException e
        ) {

            throw new IllegalStateException(
                    "SHA-256 is not available.",
                    e
            );
        }
    }
}