package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.SitePhoto;
import com.skyward.projectmanagement.service.SitePhotoService;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@RestController
public class SitePhotoController {

    private final SitePhotoService sitePhotoService;

    public SitePhotoController(
            SitePhotoService sitePhotoService
    ) {
        this.sitePhotoService =
                sitePhotoService;
    }

    /*
     * =========================================================
     * SUPERVISOR
     * =========================================================
     */

    @PostMapping(
            value =
                    "/api/supervisor/projects/{projectId}/site-photos",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> uploadSupervisorPhoto(
            Authentication authentication,
            @PathVariable Long projectId,
            @RequestParam LocalDate photoDate,
            @RequestParam String category,
            @RequestParam(
                    required = false
            )
            String caption,
            @RequestParam("file")
            MultipartFile file
    ) {

        try {
            return ResponseEntity.ok(
                    sitePhotoService
                            .uploadSupervisorPhoto(
                                    authentication.getName(),
                                    projectId,
                                    photoDate,
                                    category,
                                    caption,
                                    file
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    @GetMapping(
            "/api/supervisor/projects/{projectId}/site-photos"
    )
    public ResponseEntity<?> getSupervisorPhotos(
            Authentication authentication,
            @PathVariable Long projectId
    ) {

        try {
            return ResponseEntity.ok(
                    sitePhotoService
                            .getSupervisorProjectPhotos(
                                    authentication.getName(),
                                    projectId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    /*
     * =========================================================
     * ADMIN / MANAGER
     * =========================================================
     */

    @GetMapping(
            "/api/site-photos/project/{projectId}"
    )
    public ResponseEntity<?> getManagementProjectPhotos(
            Authentication authentication,
            @PathVariable Long projectId
    ) {

        try {
            return ResponseEntity.ok(
                    sitePhotoService
                            .getProjectPhotosForManagement(
                                    authentication.getName(),
                                    projectId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    @PutMapping(
            "/api/site-photos/{photoId}/client-visible"
    )
    public ResponseEntity<?> updateClientVisibility(
            Authentication authentication,
            @PathVariable Long photoId,
            @RequestBody
            ClientVisibilityBody body
    ) {

        try {
            return ResponseEntity.ok(
                    sitePhotoService
                            .updateClientVisibility(
                                    authentication.getName(),
                                    photoId,
                                    body.isClientVisible()
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    /*
     * =========================================================
     * PHOTO FILE
     * =========================================================
     */

    @GetMapping(
            "/api/site-photos/{photoId}/file"
    )
    public ResponseEntity<Resource> getPhotoFile(
            @PathVariable Long photoId
    ) {

        Resource resource =
                sitePhotoService
                        .loadPhotoFile(
                                photoId
                        );

        return ResponseEntity
                .ok()
                .contentType(
                        MediaType.APPLICATION_OCTET_STREAM
                )
                .body(resource);
    }

    public static class ClientVisibilityBody {

        private boolean clientVisible;

        public boolean isClientVisible() {
            return clientVisible;
        }

        public void setClientVisible(
                boolean clientVisible
        ) {
            this.clientVisible =
                    clientVisible;
        }
    }
}