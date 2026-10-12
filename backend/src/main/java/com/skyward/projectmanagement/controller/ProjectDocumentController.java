package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.ProjectDocument;
import com.skyward.projectmanagement.service.ProjectDocumentService;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@RestController
public class ProjectDocumentController {

    private final ProjectDocumentService
            projectDocumentService;

    public ProjectDocumentController(
            ProjectDocumentService projectDocumentService
    ) {
        this.projectDocumentService =
                projectDocumentService;
    }

    /*
     * =========================================================
     * SUPERVISOR
     * =========================================================
     */

    @PostMapping(
            value =
                    "/api/supervisor/projects/{projectId}/documents",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?>
    uploadSupervisorDocument(
            Authentication authentication,
            @PathVariable Long projectId,
            @RequestParam(
                    required = false
            )
            LocalDate documentDate,
            @RequestParam
            String title,
            @RequestParam(
                    required = false
            )
            String description,
            @RequestParam(
                    required = false
            )
            ProjectDocument.DocumentType documentType,
            @RequestParam("file")
            MultipartFile file
    ) {

        try {

            return ResponseEntity.ok(
                    projectDocumentService
                            .uploadSupervisorDocument(
                                    authentication.getName(),
                                    projectId,
                                    documentDate,
                                    title,
                                    description,
                                    documentType,
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
            "/api/supervisor/projects/{projectId}/documents"
    )
    public ResponseEntity<?>
    getSupervisorDocuments(
            Authentication authentication,
            @PathVariable Long projectId
    ) {

        try {

            return ResponseEntity.ok(
                    projectDocumentService
                            .getSupervisorProjectDocuments(
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
            "/api/supervisor/projects/{projectId}/documents/{documentId}/file"
    )
    public ResponseEntity<Resource>
    downloadSupervisorDocument(
            Authentication authentication,
            @PathVariable Long projectId,
            @PathVariable Long documentId
    ) {

        ProjectDocument document =
                projectDocumentService
                        .getSupervisorDocument(
                                authentication.getName(),
                                projectId,
                                documentId
                        );

        Resource resource =
                projectDocumentService
                        .loadSupervisorDocumentFile(
                                authentication.getName(),
                                projectId,
                                documentId
                        );

        return downloadResponse(
                document,
                resource
        );
    }

    /*
     * =========================================================
     * ADMIN / MANAGER
     * =========================================================
     */

    @GetMapping(
            "/api/project-documents"
    )
    public ResponseEntity<?>
    getAllDocuments(
            Authentication authentication
    ) {

        try {

            return ResponseEntity.ok(
                    projectDocumentService
                            .getAllForManagement(
                                    authentication.getName()
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
            "/api/project-documents/project/{projectId}"
    )
    public ResponseEntity<?>
    getProjectDocuments(
            Authentication authentication,
            @PathVariable Long projectId
    ) {

        try {

            return ResponseEntity.ok(
                    projectDocumentService
                            .getProjectDocumentsForManagement(
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
            "/api/project-documents/{documentId}/client-visible"
    )
    public ResponseEntity<?>
    updateClientVisibility(
            Authentication authentication,
            @PathVariable Long documentId,
            @RequestBody
            ClientVisibilityBody body
    ) {

        try {

            return ResponseEntity.ok(
                    projectDocumentService
                            .updateClientVisibility(
                                    authentication.getName(),
                                    documentId,
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

    @GetMapping(
            "/api/project-documents/{documentId}/file"
    )
    public ResponseEntity<Resource>
    downloadManagementDocument(
            Authentication authentication,
            @PathVariable Long documentId
    ) {

        ProjectDocument document =
                projectDocumentService
                        .getDocumentForManagement(
                                authentication.getName(),
                                documentId
                        );

        Resource resource =
                projectDocumentService
                        .loadManagementDocumentFile(
                                authentication.getName(),
                                documentId
                        );

        return downloadResponse(
                document,
                resource
        );
    }

    /*
     * =========================================================
     * HELPERS
     * =========================================================
     */

    private ResponseEntity<Resource>
    downloadResponse(
            ProjectDocument document,
            Resource resource
    ) {

        MediaType mediaType =
                MediaType.APPLICATION_OCTET_STREAM;

        if (
                document.getContentType()
                        != null
                        &&
                !document.getContentType()
                        .isBlank()
        ) {
            try {
                mediaType =
                        MediaType.parseMediaType(
                                document.getContentType()
                        );
            } catch (Exception ignored) {
                mediaType =
                        MediaType.APPLICATION_OCTET_STREAM;
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

    public static class
    ClientVisibilityBody {

        private boolean
                clientVisible;

        public boolean
        isClientVisible() {
            return clientVisible;
        }

        public void
        setClientVisible(
                boolean clientVisible
        ) {
            this.clientVisible =
                    clientVisible;
        }
    }
}