package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.dto.ChangePasswordRequest;
import com.skyward.projectmanagement.dto.ClientProfileDto;
import com.skyward.projectmanagement.dto.UpdateClientProfileRequest;

import com.skyward.projectmanagement.service.ClientProfileService;

import org.springframework.core.io.Resource;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/client/profile")
public class ClientProfileController {

    private final ClientProfileService
            clientProfileService;

    public ClientProfileController(
            ClientProfileService clientProfileService
    ) {

        this.clientProfileService =
                clientProfileService;
    }

    /*
     * =========================================================
     * PROFILE
     * =========================================================
     */

    @GetMapping
    public ResponseEntity<?>
    getProfile(
            Authentication authentication
    ) {

        try {

            ClientProfileDto profile =
                    clientProfileService
                            .getProfile(
                                    authentication.getName()
                            );

            return ResponseEntity.ok(
                    profile
            );

        } catch (RuntimeException e) {

            return badRequest(
                    e.getMessage()
            );
        }
    }

    @PutMapping
    public ResponseEntity<?>
    updateProfile(
            @RequestBody
            UpdateClientProfileRequest request,

            Authentication authentication
    ) {

        try {

            ClientProfileDto profile =
                    clientProfileService
                            .updateProfile(
                                    authentication.getName(),
                                    request
                            );

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "success",
                    true
            );

            response.put(
                    "message",
                    "Profile updated successfully."
            );

            response.put(
                    "profile",
                    profile
            );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException e) {

            return badRequest(
                    e.getMessage()
            );
        }
    }

    /*
     * =========================================================
     * PROFILE PHOTO
     * =========================================================
     */

    @PostMapping(
            value = "/photo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?>
    uploadPhoto(
            @RequestParam("file")
            MultipartFile file,

            Authentication authentication
    ) {

        try {

            ClientProfileDto profile =
                    clientProfileService
                            .uploadProfilePhoto(
                                    authentication.getName(),
                                    file
                            );

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "success",
                    true
            );

            response.put(
                    "message",
                    "Profile photo updated successfully."
            );

            response.put(
                    "profile",
                    profile
            );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException e) {

            return badRequest(
                    e.getMessage()
            );
        }
    }

    @GetMapping("/photo")
    public ResponseEntity<?>
    getPhoto(
            Authentication authentication
    ) {

        try {

            Resource resource =
                    clientProfileService
                            .getProfilePhoto(
                                    authentication.getName()
                            );

            String contentType =
                    clientProfileService
                            .getProfilePhotoContentType(
                                    authentication.getName()
                            );

            MediaType mediaType;

            try {

                mediaType =
                        MediaType.parseMediaType(
                                contentType
                        );

            } catch (Exception e) {

                mediaType =
                        MediaType.APPLICATION_OCTET_STREAM;
            }

            return ResponseEntity
                    .ok()
                    .contentType(
                            mediaType
                    )
                    .body(
                            resource
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    @DeleteMapping("/photo")
    public ResponseEntity<?>
    deletePhoto(
            Authentication authentication
    ) {

        try {

            ClientProfileDto profile =
                    clientProfileService
                            .deleteProfilePhoto(
                                    authentication.getName()
                            );

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "success",
                    true
            );

            response.put(
                    "message",
                    "Profile photo removed successfully."
            );

            response.put(
                    "profile",
                    profile
            );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException e) {

            return badRequest(
                    e.getMessage()
            );
        }
    }

    /*
     * =========================================================
     * PASSWORD
     * =========================================================
     */

    @PutMapping("/password")
    public ResponseEntity<?>
    changePassword(
            @RequestBody
            ChangePasswordRequest request,

            Authentication authentication
    ) {

        try {

            clientProfileService
                    .changePassword(
                            authentication.getName(),
                            request
                    );

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "success",
                    true
            );

            response.put(
                    "message",
                    "Password changed successfully."
            );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException e) {

            return badRequest(
                    e.getMessage()
            );
        }
    }

    /*
     * =========================================================
     * RESPONSE HELPER
     * =========================================================
     */

    private ResponseEntity<Map<String, Object>>
    badRequest(
            String message
    ) {

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "success",
                false
        );

        response.put(
                "message",
                message
        );

        return ResponseEntity
                .badRequest()
                .body(
                        response
                );
    }
}