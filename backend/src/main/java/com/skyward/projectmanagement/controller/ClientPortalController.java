package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.dto.ClientDashboardDto;
import com.skyward.projectmanagement.dto.ClientProjectSummaryDto;
import com.skyward.projectmanagement.entity.SitePhoto;
import com.skyward.projectmanagement.service.ClientPortalService;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
public class ClientPortalController {

    private final ClientPortalService
            clientPortalService;

    public ClientPortalController(
            ClientPortalService clientPortalService
    ) {
        this.clientPortalService =
                clientPortalService;
    }

    /*
     * =========================================================
     * PROJECTS
     * =========================================================
     */

    @GetMapping("/projects")
    public ResponseEntity<
            List<ClientProjectSummaryDto>
            >
    getMyProjects(
            Authentication authentication
    ) {

        String username =
                authentication.getName();

        return ResponseEntity.ok(
                clientPortalService
                        .getMyProjects(
                                username
                        )
        );
    }

    @GetMapping(
            "/projects/{projectId}"
    )
    public ResponseEntity<
            ClientProjectSummaryDto
            >
    getMyProject(
            @PathVariable Long projectId,
            Authentication authentication
    ) {

        String username =
                authentication.getName();

        return ResponseEntity.ok(
                clientPortalService
                        .getMyProject(
                                username,
                                projectId
                        )
        );
    }

    /*
     * =========================================================
     * DASHBOARD
     * =========================================================
     */

    @GetMapping(
            "/projects/{projectId}/dashboard"
    )
    public ResponseEntity<
            ClientDashboardDto
            >
    getMyDashboard(
            @PathVariable Long projectId,
            Authentication authentication
    ) {

        String username =
                authentication.getName();

        return ResponseEntity.ok(
                clientPortalService
                        .getMyDashboard(
                                username,
                                projectId
                        )
        );
    }

    /*
     * =========================================================
     * SITE PHOTOS
     * =========================================================
     */

    @GetMapping(
            "/projects/{projectId}/site-photos"
    )
    public ResponseEntity<?>
    getMySitePhotos(
            @PathVariable Long projectId,
            Authentication authentication
    ) {

        try {

            String username =
                    authentication.getName();

            List<SitePhoto> photos =
                    clientPortalService
                            .getMyVisibleSitePhotos(
                                    username,
                                    projectId
                            );

            return ResponseEntity.ok(
                    photos
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    @GetMapping(
            "/projects/{projectId}/site-photos/{photoId}/file"
    )
    public ResponseEntity<Resource>
    getMySitePhotoFile(
            @PathVariable Long projectId,
            @PathVariable Long photoId,
            Authentication authentication
    ) {

        String username =
                authentication.getName();

        Resource resource =
                clientPortalService
                        .getMyVisibleSitePhotoFile(
                                username,
                                projectId,
                                photoId
                        );

        return ResponseEntity
                .ok()
                .contentType(
                        MediaType.APPLICATION_OCTET_STREAM
                )
                .body(
                        resource
                );
    }
}