package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.PasswordResetCode;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.repository.PasswordResetCodeRepository;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

@Service
public class PasswordResetService {

    private static final int CODE_EXPIRY_MINUTES = 10;

    private final UserRepository userRepository;
    private final PasswordResetCodeRepository resetCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("\${spring.mail.username:}")
    private String mailFrom;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetCodeRepository resetCodeRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender
    ) {
        this.userRepository = userRepository;
        this.resetCodeRepository = resetCodeRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @Transactional
    public void requestResetCode(String email) {
        if (email == null || email.isBlank()) {
            return;
        }

        List<User> users = userRepository.findByEmailIgnoreCase(email.trim());

        if (users.size() != 1) {
            return;
        }

        User user = users.get(0);

        if (Boolean.FALSE.equals(user.getActive())) {
            return;
        }

        invalidateExistingCodes(user.getId());

        String rawCode = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );

        PasswordResetCode resetCode = new PasswordResetCode();
        resetCode.setUser(user);
        resetCode.setCodeHash(hash(rawCode));
        resetCode.setCreatedAt(LocalDateTime.now());
        resetCode.setExpiresAt(
                LocalDateTime.now().plusMinutes(CODE_EXPIRY_MINUTES)
        );

        resetCodeRepository.save(resetCode);
        sendResetEmail(user, rawCode);
    }

    @Transactional
    public void resetPassword(
            String email,
            String code,
            String newPassword,
            String confirmPassword
    ) {
        if (
                email == null ||
                email.isBlank() ||
                code == null ||
                code.isBlank()
        ) {
            throw new RuntimeException(
                    "Email and verification code are required."
            );
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException(
                    "Password must contain at least 8 characters."
            );
        }

        if (
                confirmPassword == null ||
                !newPassword.equals(confirmPassword)
        ) {
            throw new RuntimeException(
                    "Password confirmation does not match."
            );
        }

        List<User> users = userRepository.findByEmailIgnoreCase(email.trim());

        if (users.size() != 1) {
            throw new RuntimeException(
                    "Invalid or expired verification code."
            );
        }

        User user = users.get(0);

        PasswordResetCode resetCode =
                resetCodeRepository
                        .findTopByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(
                                user.getId()
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Invalid or expired verification code."
                                )
                        );

        if (
                resetCode.isUsed() ||
                resetCode.isExpired() ||
                !MessageDigest.isEqual(
                        resetCode.getCodeHash()
                                .getBytes(StandardCharsets.UTF_8),
                        hash(code.trim())
                                .getBytes(StandardCharsets.UTF_8)
                )
        ) {
            throw new RuntimeException(
                    "Invalid or expired verification code."
            );
        }

        user.setPassword(
                passwordEncoder.encode(newPassword)
        );
        userRepository.save(user);

        resetCode.setUsedAt(LocalDateTime.now());
        resetCodeRepository.save(resetCode);

        invalidateExistingCodes(user.getId());
    }

    private void sendResetEmail(
            User user,
            String code
    ) {
        if (mailFrom == null || mailFrom.isBlank()) {
            throw new RuntimeException(
                    "Email service is not configured."
            );
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(user.getEmail());
        message.setSubject("CPMS Password Reset Code");

        String name =
                user.getFullName() == null ||
                user.getFullName().isBlank()
                        ? user.getUsername()
                        : user.getFullName();

        message.setText(
                "Hello " + name + ",\n\n" +
                "Your CPMS password reset code is:\n\n" +
                code + "\n\n" +
                "This code will expire in " +
                CODE_EXPIRY_MINUTES +
                " minutes.\n\n" +
                "If you did not request a password reset, you can ignore this email.\n\n" +
                "Skyward Engineering (Pvt) Ltd"
        );

        mailSender.send(message);
    }

    private void invalidateExistingCodes(Long userId) {
        List<PasswordResetCode> codes =
                resetCodeRepository.findByUserIdAndUsedAtIsNull(userId);

        if (codes.isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        for (PasswordResetCode code : codes) {
            code.setUsedAt(now);
        }

        resetCodeRepository.saveAll(codes);
    }

    private String hash(String value) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            return HexFormat.of().formatHex(
                    digest.digest(
                            value.getBytes(StandardCharsets.UTF_8)
                    )
            );
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(
                    "SHA-256 is not available.",
                    e
            );
        }
    }
}
