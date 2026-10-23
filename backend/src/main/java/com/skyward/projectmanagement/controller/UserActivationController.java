package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.dto.ActivateAccountRequest;
import com.skyward.projectmanagement.service.UserActivationService;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(
        "/api/auth/activation"
)
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
     * PUBLIC TOKEN VALIDATION
     * =========================================================
     */

    @GetMapping(
            "/validate"
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

        } catch (
                RuntimeException e
        ) {

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

    @PostMapping
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

        } catch (
                RuntimeException e
        ) {

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