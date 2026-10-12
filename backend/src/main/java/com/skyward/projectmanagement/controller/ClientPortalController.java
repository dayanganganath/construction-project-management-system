package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.dto.ClientDashboardDto;
import com.skyward.projectmanagement.dto.ClientProjectSummaryDto;
import com.skyward.projectmanagement.entity.ProjectDocument;
import com.skyward.projectmanagement.entity.SitePhoto;
import com.skyward.projectmanagement.service.ClientPortalService;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
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

    @GetMapping("/projects")
    public ResponseEntity<
            List<ClientProjectSummaryDto>
            >
    getMyProjects(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                clientPortalService
                        .getMyProjects(
                                authentication.getName()
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

        return ResponseEntity.ok(
                clientPortalService
                        .getMyProject(
                                authentication.getName(),
                                projectId
                        )
        );
    }

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

        return ResponseEntity.ok(
                clientPortalService
                        .getMyDashboard(
                                authentication.getName(),
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

            List<SitePhoto> photos =
                    clientPortalService
                            .getMyVisibleSitePhotos(
                                    authentication.getName(),
                                    projectId
                            );

            return ResponseEntity.ok(
                    photos
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
            "/projects/{projectId}/site-photos/{photoId}/file"
    )
    public ResponseEntity<Resource>
    getMySitePhotoFile(
            @PathVariable Long projectId,
            @PathVariable Long photoId,
            Authentication authentication
    ) {

        Resource resource =
                clientPortalService
                        .getMyVisibleSitePhotoFile(
                                authentication.getName(),
                                projectId,
                                photoId
                        );

        return ResponseEntity
                .ok()
                .contentType(
                        MediaType.APPLICATION_OCTET_STREAM
                )
                .body(resource);
    }

    /*
     * =========================================================
     * DOCUMENTS
     * =========================================================
     */

    @GetMapping(
            "/projects/{projectId}/documents"
    )
    public ResponseEntity<?>
    getMyDocuments(
            @PathVariable Long projectId,
            Authentication authentication
    ) {

        try {

            return ResponseEntity.ok(
                    clientPortalService
                            .getMyVisibleDocuments(
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

    @GetMapping(
            "/projects/{projectId}/documents/{documentId}/file"
    )
    public ResponseEntity<Resource>
    downloadMyDocument(
            @PathVariable Long projectId,
            @PathVariable Long documentId,
            Authentication authentication
    ) {

        ProjectDocument document =
                clientPortalService
                        .getMyVisibleDocument(
                                authentication.getName(),
                                projectId,
                                documentId
                        );

        Resource resource =
                clientPortalService
                        .getMyVisibleDocumentFile(
                                authentication.getName(),
                                projectId,
                                documentId
                        );

        MediaType mediaType =
                MediaType.APPLICATION_OCTET_STREAM;

        if (
                document.getContentType() != null
                        &&
                !document.getContentType().isBlank()
        ) {
            try {

                mediaType =
                        MediaType.parseMediaType(
                                document.getContentType()
                        );

            } catch (Exception ignored) {
            }
        }

        String safeFileName =
                document
                        .getOriginalFileName()
                        .replace(
                                "\"",
                                ""
                        );

        return ResponseEntity
                .ok()
                .contentType(
                        mediaType
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                safeFileName +
                                "\""
                )
                .body(
                        resource
                );
    }
}