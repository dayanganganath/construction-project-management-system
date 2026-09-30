package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.SubcontractorPayment;
import com.skyward.projectmanagement.service.PaymentSlipExtractionService;
import com.skyward.projectmanagement.service.SubcontractorPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/subcontractor-payments")
public class SubcontractorPaymentController {

    private final SubcontractorPaymentService paymentService;
    private final PaymentSlipExtractionService extractionService;

    private static final String UPLOAD_DIR =
            "uploads/payment-slips/";

    public SubcontractorPaymentController(
            SubcontractorPaymentService paymentService,
            PaymentSlipExtractionService extractionService
    ) {
        this.paymentService = paymentService;
        this.extractionService = extractionService;
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
                            "message", e.getMessage()
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
                            "message", "Please select a payment slip file."
                    )
            );
        }

        String contentType = file.getContentType();

        boolean validFile =
                "application/pdf".equalsIgnoreCase(contentType)
                        || (
                        contentType != null
                                && contentType.startsWith("image/")
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
                    getExtension(originalFileName);

            String savedFileName =
                    UUID.randomUUID() + extension;

            Path uploadDirectory =
                    Paths.get(UPLOAD_DIR);

            Files.createDirectories(uploadDirectory);

            Path destination =
                    uploadDirectory.resolve(savedFileName);

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

            return ResponseEntity.ok(updatedPayment);

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
                            "message", e.getMessage()
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
                            || payment.getSlipFilePath().isBlank()
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
                            || !fileName.toLowerCase().endsWith(".pdf")
            ) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "success", false,
                                "message",
                                "Automatic extraction currently supports text-based PDF slips only."
                        )
                );
            }

            Map<String, Object> extracted =
                    extractionService.extractFromPdf(
                            payment.getSlipFilePath()
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "paymentId", payment.getId(),
                            "fileName", payment.getSlipFileName(),
                            "extractedData", extracted
                    )
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
                            "message", e.getMessage()
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
                            "message", e.getMessage()
                    )
            );
        }
    }

    private String getExtension(
            String fileName
    ) {

        if (
                fileName == null
                        || !fileName.contains(".")
        ) {
            return "";
        }

        return fileName.substring(
                fileName.lastIndexOf(".")
        );
    }
}