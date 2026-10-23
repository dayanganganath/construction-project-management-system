package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.dto.ActivationInviteResponse;
import com.skyward.projectmanagement.dto.CreateClientInviteRequest;
import com.skyward.projectmanagement.dto.UserResponse;

import com.skyward.projectmanagement.entity.User;

import com.skyward.projectmanagement.service.UserActivationService;
import com.skyward.projectmanagement.service.UserService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(
        "/api/users"
)
@CrossOrigin(
        origins = "http://localhost:5173"
)
public class UserController {

    private final UserService
            userService;

    private final UserActivationService
            userActivationService;

    public UserController(
            UserService userService,
            UserActivationService userActivationService
    ) {

        this.userService =
                userService;

        this.userActivationService =
                userActivationService;
    }

    /*
     * =========================================================
     * USERS
     * =========================================================
     */

    @GetMapping
    public List<UserResponse>
    getAllUsers() {

        return userService
                .getAllUsers();
    }

    @PostMapping
    public ResponseEntity<?>
    createUser(
            @RequestBody User user
    ) {

        try {

            return ResponseEntity.ok(
                    userService
                            .createUser(
                                    user
                            )
            );

        } catch (
                RuntimeException e
        ) {

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
     * CREATE CLIENT + ACTIVATION INVITE
     * =========================================================
     *
     * ADMIN only because /api/users/** is protected
     * by SecurityConfig.
     *
     * This endpoint:
     *
     * 1. Creates inactive CLIENT user
     * 2. Generates secure one-time activation token
     * 3. Returns raw token only once
     * =========================================================
     */

    @PostMapping(
            "/client-invites"
    )
    public ResponseEntity<?>
    createClientInvite(
            @RequestBody
            CreateClientInviteRequest request,
            Authentication authentication
    ) {

        try {

            User user =
                    userService
                            .createInvitedClient(
                                    request
                            );

            String createdBy =
                    authentication != null
                            ? authentication
                                    .getName()
                            : "SYSTEM";

            ActivationInviteResponse
                    invite =
                    userActivationService
                            .createActivationInvite(
                                    user.getId(),
                                    createdBy
                            );

            return ResponseEntity.ok(
                    invite
            );

        } catch (
                RuntimeException e
        ) {

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
     * REGENERATE INVITE
     * =========================================================
     *
     * Only works while CLIENT account is still inactive.
     * Existing unused token is invalidated automatically.
     * =========================================================
     */

    @PostMapping(
            "/{userId}/activation-invite"
    )
    public ResponseEntity<?>
    regenerateActivationInvite(
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

        } catch (
                RuntimeException e
        ) {

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
     * UPDATE
     * =========================================================
     */

    @PutMapping(
            "/{id}"
    )
    public ResponseEntity<?>
    updateUser(
            @PathVariable Long id,
            @RequestBody User user
    ) {

        try {

            return ResponseEntity.ok(
                    userService
                            .updateUser(
                                    id,
                                    user
                            )
            );

        } catch (
                RuntimeException e
        ) {

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
     * DELETE
     * =========================================================
     */

    @DeleteMapping(
            "/{id}"
    )
    public ResponseEntity<?>
    deleteUser(
            @PathVariable Long id
    ) {

        try {

            userService.deleteUser(
                    id
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "User deleted successfully."
                    )
            );

        } catch (
                RuntimeException e
        ) {

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
}