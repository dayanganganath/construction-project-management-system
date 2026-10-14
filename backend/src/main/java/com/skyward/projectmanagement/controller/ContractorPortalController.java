package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.ProjectDocument;
import com.skyward.projectmanagement.entity.SubcontractorPayment;
import com.skyward.projectmanagement.service.ContractorPortalService;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(
        "/api/contractor"
)
public class ContractorPortalController {

    private final ContractorPortalService
            contractorPortalService;

    public ContractorPortalController(
            ContractorPortalService contractorPortalService
    ) {
        this.contractorPortalService =
                contractorPortalService;
    }

    /*
     * =========================================================
     * PROFILE
     * =========================================================
     */

    @GetMapping(
            "/profile"
    )
    public ResponseEntity<
            Map<String, Object>
            > getMyProfile(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                contractorPortalService
                        .getMyProfile(
                                authentication.getName()
                        )
        );
    }

    /*
     * =========================================================
     * DASHBOARD
     * =========================================================
     */

    @GetMapping(
            "/dashboard"
    )
    public ResponseEntity<
            Map<String, Object>
            > getDashboard(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                contractorPortalService
                        .getDashboard(
                                authentication.getName()
                        )
        );
    }

    /*
     * =========================================================
     * PROJECTS
     * =========================================================
     */

    @GetMapping(
            "/projects"
    )
    public ResponseEntity<
            List<Map<String, Object>>
            > getMyProjects(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                contractorPortalService
                        .getMyProjects(
                                authentication.getName()
                        )
        );
    }

    /*
     * =========================================================
     * BILLS
     * =========================================================
     */

    @GetMapping(
            "/bills"
    )
    public ResponseEntity<
            List<Map<String, Object>>
            > getMyBills(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                contractorPortalService
                        .getMyBills(
                                authentication.getName()
                        )
        );
    }

    /*
     * =========================================================
     * PAYMENTS
     * =========================================================
     */

    @GetMapping(
            "/payments"
    )
    public ResponseEntity<
            List<Map<String, Object>>
            > getMyPayments(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                contractorPortalService
                        .getMyPayments(
                                authentication.getName()
                        )
        );
    }

    /*
     * Secure payment slip download.
     */
    @GetMapping(
            "/payments/{paymentId}/slip"
    )
    public ResponseEntity<?> downloadPaymentSlip(
            @PathVariable Long paymentId,
            Authentication authentication
    ) {

        try {

            SubcontractorPayment payment =
                    contractorPortalService
                            .getMyPaymentForSlip(
                                    authentication.getName(),
                                    paymentId
                            );

            Path filePath =
                    Paths.get(
                            payment.getSlipFilePath()
                    )
                    .toAbsolutePath()
                    .normalize();

            if (
                    !Files.exists(filePath)
                            ||
                    !Files.isRegularFile(filePath)
            ) {
                return ResponseEntity
                        .notFound()
                        .build();
            }

            Resource resource =
                    new UrlResource(
                            filePath.toUri()
                    );

            if (
                    !resource.exists()
                            ||
                    !resource.isReadable()
            ) {
                return ResponseEntity
                        .notFound()
                        .build();
            }

            String contentType =
                    detectContentType(
                            filePath,
                            payment.getSlipFileName()
                    );

            String downloadFileName =
                    payment.getSlipFileName();

            if (
                    downloadFileName == null
                            ||
                    downloadFileName.isBlank()
            ) {

                downloadFileName =
                        "payment-slip-"
                                + payment.getId();
            }

            return ResponseEntity
                    .ok()
                    .contentType(
                            MediaType.parseMediaType(
                                    contentType
                            )
                    )
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\""
                                    + sanitizeFileName(
                                            downloadFileName
                                    )
                                    + "\""
                    )
                    .body(
                            resource
                    );

        } catch (MalformedURLException e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    "Unable to read payment slip file."
                            )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            errorResponse(
                                    e,
                                    "Unable to download payment slip."
                            )
                    );
        }
    }

    /*
     * =========================================================
     * PROJECT DOCUMENTS
     * =========================================================
     */

    @GetMapping(
            "/documents"
    )
    public ResponseEntity<?> getMyDocuments(
            Authentication authentication
    ) {

        try {

            return ResponseEntity.ok(
                    contractorPortalService
                            .getMyDocuments(
                                    authentication.getName()
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            errorResponse(
                                    e,
                                    "Unable to load project documents."
                            )
                    );
        }
    }

    @GetMapping(
            "/projects/{projectId}/documents"
    )
    public ResponseEntity<?> getMyProjectDocuments(
            Authentication authentication,
            @PathVariable Long projectId
    ) {

        try {

            return ResponseEntity.ok(
                    contractorPortalService
                            .getMyProjectDocuments(
                                    authentication.getName(),
                                    projectId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            errorResponse(
                                    e,
                                    "Unable to load project documents."
                            )
                    );
        }
    }

    /*
     * Secure contractor document download.
     *
     * Contractor can download only:
     * 1. contractorVisible = true document
     * 2. document belonging to an actively assigned project
     */
    @GetMapping(
            "/documents/{documentId}/file"
    )
    public ResponseEntity<?> downloadProjectDocument(
            Authentication authentication,
            @PathVariable Long documentId
    ) {

        try {

            ProjectDocument document =
                    contractorPortalService
                            .getMyDocumentForDownload(
                                    authentication.getName(),
                                    documentId
                            );

            Path filePath =
                    Paths.get(
                            document.getFilePath()
                    )
                    .toAbsolutePath()
                    .normalize();

            if (
                    !Files.exists(filePath)
                            ||
                    !Files.isRegularFile(filePath)
            ) {
                return ResponseEntity
                        .notFound()
                        .build();
            }

            Resource resource =
                    new UrlResource(
                            filePath.toUri()
                    );

            if (
                    !resource.exists()
                            ||
                    !resource.isReadable()
            ) {
                return ResponseEntity
                        .notFound()
                        .build();
            }

            String contentType =
                    detectContentType(
                            filePath,
                            document.getOriginalFileName()
                    );

            String downloadFileName =
                    document.getOriginalFileName();

            if (
                    downloadFileName == null
                            ||
                    downloadFileName.isBlank()
            ) {

                downloadFileName =
                        "project-document-"
                                + document.getId();
            }

            return ResponseEntity
                    .ok()
                    .contentType(
                            MediaType.parseMediaType(
                                    contentType
                            )
                    )
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\""
                                    + sanitizeFileName(
                                            downloadFileName
                                    )
                                    + "\""
                    )
                    .body(
                            resource
                    );

        } catch (MalformedURLException e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    "Unable to read project document file."
                            )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            errorResponse(
                                    e,
                                    "Unable to download project document."
                            )
                    );
        }
    }

    /*
     * =========================================================
     * HELPERS
     * =========================================================
     */

    private String detectContentType(
            Path filePath,
            String fileName
    ) {

        String contentType;

        try {

            contentType =
                    Files.probeContentType(
                            filePath
                    );

        } catch (IOException e) {

            contentType = null;
        }

        if (
                contentType != null
                        &&
                !contentType.isBlank()
        ) {
            return contentType;
        }

        if (fileName != null) {

            String lower =
                    fileName.toLowerCase();

            if (
                    lower.endsWith(
                            ".pdf"
                    )
            ) {
                return MediaType
                        .APPLICATION_PDF_VALUE;
            }

            if (
                    lower.endsWith(
                            ".jpg"
                    )
                            ||
                    lower.endsWith(
                            ".jpeg"
                    )
            ) {
                return MediaType
                        .IMAGE_JPEG_VALUE;
            }

            if (
                    lower.endsWith(
                            ".png"
                    )
            ) {
                return MediaType
                        .IMAGE_PNG_VALUE;
            }
        }

        return MediaType
                .APPLICATION_OCTET_STREAM_VALUE;
    }

    private String sanitizeFileName(
            String fileName
    ) {

        return fileName
                .replace(
                        "\"",
                        ""
                )
                .replace(
                        "\r",
                        ""
                )
                .replace(
                        "\n",
                        ""
                );
    }

    private Map<String, Object> errorResponse(
            RuntimeException e,
            String fallbackMessage
    ) {

        String message =
                e.getMessage() != null
                        &&
                !e.getMessage().isBlank()
                        ? e.getMessage()
                        : fallbackMessage;

        return Map.of(
                "success",
                false,
                "message",
                message
        );
    }
}