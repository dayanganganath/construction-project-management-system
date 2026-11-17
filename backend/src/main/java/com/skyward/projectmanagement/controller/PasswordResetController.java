package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.service.PasswordResetService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/password-reset")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(
            PasswordResetService passwordResetService
    ) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestCode(
            @RequestBody Map<String, String> request
    ) {
        try {
            passwordResetService.requestResetCode(
                    request.get("email")
            );

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message",
                            "If an active account exists for this email, a verification code has been sent."
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", e.getMessage()
                            )
                    );
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmReset(
            @RequestBody Map<String, String> request
    ) {
        try {
            passwordResetService.resetPassword(
                    request.get("email"),
                    request.get("code"),
                    request.get("newPassword"),
                    request.get("confirmPassword")
            );

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message",
                            "Password reset successfully."
                    )
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", e.getMessage()
                            )
                    );
        }
    }
}
