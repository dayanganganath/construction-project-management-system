package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.dto.ActivateAccountRequest;
import com.skyward.projectmanagement.service.UserActivationService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class UserActivationController {

    private final UserActivationService
            userActivationService;

    public UserActivationController(
            UserActivationService userActivationService
    ) {
        this.userActivationService =
                userActivationService;
    }

    /*
     * =========================================================
     * ADMIN
     * =========================================================
     *
     * SecurityConfig already protects /api/users/**
     * as ADMIN only.
     */
    @PostMapping(
            "/api/users/{userId}/activation-invite"
    )
    public ResponseEntity<?>
    createActivationInvite(
            @PathVariable Long userId,
            Authentication authentication
    ) {

        try {

            String createdBy =
                    authentication != null
                            ? authentication
                                    .getName()
                            : "SYSTEM";

            return ResponseEntity.ok(
                    userActivationService
                            .createActivationInvite(
                                    userId,
                                    createdBy
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    /*
     * =========================================================
     * PUBLIC TOKEN VALIDATION
     * =========================================================
     *
     * /api/auth/** is already permitAll().
     */
    @GetMapping(
            "/api/auth/activation/validate"
    )
    public ResponseEntity<?>
    validateActivationToken(
            @RequestParam String token
    ) {

        try {

            userActivationService
                    .validateToken(
                            token
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "valid",
                            true,
                            "message",
                            "Activation token is valid."
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "valid",
                                    false,
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    /*
     * =========================================================
     * PUBLIC ACCOUNT ACTIVATION
     * =========================================================
     */
    @PostMapping(
            "/api/auth/activation"
    )
    public ResponseEntity<?>
    activateAccount(
            @RequestBody
            ActivateAccountRequest request
    ) {

        try {

            userActivationService
                    .activateAccount(
                            request
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "success",
                            true,
                            "message",
                            "Account activated successfully. You can now log in."
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }
}