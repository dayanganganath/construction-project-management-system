package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.SubcontractorPayment;
import com.skyward.projectmanagement.service.PaymentSlipExtractionService;
import com.skyward.projectmanagement.service.PaymentSlipMatchingService;
import com.skyward.projectmanagement.service.SubcontractorPaymentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/subcontractor-payments")
public class SubcontractorPaymentController {

    private final SubcontractorPaymentService paymentService;
    private final PaymentSlipExtractionService extractionService;
    private final PaymentSlipMatchingService matchingService;

    private static final String UPLOAD_DIR =
            "uploads/payment-slips/";

    public SubcontractorPaymentController(
            SubcontractorPaymentService paymentService,
            PaymentSlipExtractionService extractionService,
            PaymentSlipMatchingService matchingService
    ) {
        this.paymentService = paymentService;
        this.extractionService = extractionService;
        this.matchingService = matchingService;
    }

    @GetMapping
    public ResponseEntity<List<SubcontractorPayment>> getAllPayments() {
        return ResponseEntity.ok(
                paymentService.getAllPayments()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubcontractorPayment> getPaymentById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                paymentService.getPaymentById(id)
        );
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<SubcontractorPayment>> getPaymentsByProject(
            @PathVariable Long projectId
    ) {
        return ResponseEntity.ok(
                paymentService.getPaymentsByProject(projectId)
        );
    }

    @GetMapping("/contractor/{contractorId}")
    public ResponseEntity<List<SubcontractorPayment>> getPaymentsByContractor(
            @PathVariable Long contractorId
    ) {
        return ResponseEntity.ok(
                paymentService.getPaymentsByContractor(contractorId)
        );
    }

    @GetMapping("/bill/{billId}")
    public ResponseEntity<List<SubcontractorPayment>> getPaymentsByBill(
            @PathVariable Long billId
    ) {
        return ResponseEntity.ok(
                paymentService.getPaymentsByBill(billId)
        );
    }

    /*
     * NEW:
     * Upload PDF first -> extract details -> auto match subcontractor.
     * Payment is NOT saved yet.
     */
    @PostMapping("/analyze-upload")
    public ResponseEntity<?> analyzeUploadedSlip(
            @RequestParam("file") MultipartFile file
    ) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message", "Please select a payment slip PDF."
                    )
            );
        }

        String contentType = file.getContentType();
        String originalFileName = file.getOriginalFilename();

        boolean isPdf =
                "application/pdf".equalsIgnoreCase(contentType)
                        ||
                        (
                                originalFileName != null
                                        &&
                                        originalFileName
                                                .toLowerCase()
                                                .endsWith(".pdf")
                        );

        if (!isPdf) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message",
                            "Automatic payment slip analysis currently supports PDF files only."
                    )
            );
        }

        Path tempFile = null;

        try {

            tempFile = Files.createTempFile(
                    "payment-slip-",
                    ".pdf"
            );

            Files.copy(
                    file.getInputStream(),
                    tempFile,
                    StandardCopyOption.REPLACE_EXISTING
            );

            Map<String, Object> extractedData =
                    extractionService.extractFromPdf(
                            tempFile.toString()
                    );

            Map<String, Object> contractorMatch =
                    matchingService.matchContractor(
                            extractedData
                    );

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put("success", true);
            response.put(
                    "fileName",
                    originalFileName
            );

            response.put(
                    "extractedData",
                    extractedData
            );

            response.put(
                    "contractorMatch",
                    contractorMatch
            );

            return ResponseEntity.ok(response);

        } catch (IOException e) {

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "success", false,
                            "message",
                            "Unable to analyze payment slip PDF."
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to analyze payment slip."
                    )
            );

        } finally {

            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (IOException ignored) {
                }
            }
        }
    }

    @PostMapping
    public ResponseEntity<?> createPayment(
            @RequestBody SubcontractorPayment payment
    ) {
        try {

            SubcontractorPayment saved =
                    paymentService.createPayment(payment);

            return ResponseEntity.ok(saved);

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to create payment."
                    )
            );
        }
    }

    @PostMapping("/{id}/upload-slip")
    public ResponseEntity<?> uploadSlip(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message",
                            "Please select a payment slip file."
                    )
            );
        }

        String contentType =
                file.getContentType();

        boolean validFile =
                "application/pdf".equalsIgnoreCase(
                        contentType
                )
                        ||
                        (
                                contentType != null
                                        &&
                                        contentType.startsWith(
                                                "image/"
                                        )
                        );

        if (!validFile) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message",
                            "Only PDF or image files are allowed."
                    )
            );
        }

        try {

            String originalFileName =
                    file.getOriginalFilename();

            String extension =
                    getExtension(
                            originalFileName
                    );

            String savedFileName =
                    UUID.randomUUID()
                            + extension;

            Path uploadDirectory =
                    Paths.get(UPLOAD_DIR);

            Files.createDirectories(
                    uploadDirectory
            );

            Path destination =
                    uploadDirectory.resolve(
                            savedFileName
                    );

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

            SubcontractorPayment updatedPayment =
                    paymentService.attachSlip(
                            id,
                            originalFileName,
                            destination.toString()
                    );

            return ResponseEntity.ok(
                    updatedPayment
            );

        } catch (IOException e) {

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "success", false,
                            "message",
                            "Unable to save payment slip."
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to upload payment slip."
                    )
            );
        }
    }

    @GetMapping("/{id}/analyze-slip")
    public ResponseEntity<?> analyzeSlip(
            @PathVariable Long id
    ) {

        try {

            SubcontractorPayment payment =
                    paymentService.getPaymentById(id);

            if (
                    payment.getSlipFilePath() == null
                            ||
                            payment.getSlipFilePath().isBlank()
            ) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "success", false,
                                "message",
                                "No payment slip has been uploaded."
                        )
                );
            }

            String fileName =
                    payment.getSlipFileName();

            if (
                    fileName == null
                            ||
                            !fileName
                                    .toLowerCase()
                                    .endsWith(".pdf")
            ) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "success", false,
                                "message",
                                "Automatic extraction currently supports PDF slips only."
                        )
                );
            }

            Map<String, Object> extractedData =
                    extractionService.extractFromPdf(
                            payment.getSlipFilePath()
                    );

            Map<String, Object> contractorMatch =
                    matchingService.matchContractor(
                            extractedData
                    );

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put("success", true);
            response.put(
                    "paymentId",
                    payment.getId()
            );
            response.put(
                    "fileName",
                    payment.getSlipFileName()
            );
            response.put(
                    "extractedData",
                    extractedData
            );
            response.put(
                    "contractorMatch",
                    contractorMatch
            );

            return ResponseEntity.ok(
                    response
            );

        } catch (IOException e) {

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "success", false,
                            "message",
                            "Unable to read payment slip PDF."
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to analyze payment slip."
                    )
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePayment(
            @PathVariable Long id
    ) {

        try {

            paymentService.deletePayment(id);

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message",
                            "Payment deleted successfully."
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to delete payment."
                    )
            );
        }
    }

    private String getExtension(
            String fileName
    ) {

        if (
                fileName == null
                        ||
                        !fileName.contains(".")
        ) {
            return "";
        }

        return fileName.substring(
                fileName.lastIndexOf(".")
        );
    }
}