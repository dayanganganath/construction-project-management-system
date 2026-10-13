package com.skyward.projectmanagement.controller;

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
     *
     * Contractor can only download
     * a slip that belongs to their own payment.
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
                    .normalize();

            if (
                    !Files.exists(filePath) ||
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

            if (!resource.exists()) {
                return ResponseEntity
                        .notFound()
                        .build();
            }

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
                    contentType == null ||
                    contentType.isBlank()
            ) {

                String fileName =
                        payment.getSlipFileName();

                if (
                        fileName != null &&
                        fileName
                                .toLowerCase()
                                .endsWith(".pdf")
                ) {

                    contentType =
                            MediaType
                                    .APPLICATION_PDF_VALUE;

                } else {

                    contentType =
                            MediaType
                                    .APPLICATION_OCTET_STREAM_VALUE;
                }
            }

            String downloadFileName =
                    payment.getSlipFileName();

            if (
                    downloadFileName == null ||
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
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Unable to download payment slip."
                            )
                    );
        }
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
}