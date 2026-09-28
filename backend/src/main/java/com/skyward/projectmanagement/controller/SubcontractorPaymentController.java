package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.SubcontractorPayment;
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

    private static final String UPLOAD_DIR =
            "uploads/payment-slips/";

    public SubcontractorPaymentController(
            SubcontractorPaymentService paymentService
    ) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public List<SubcontractorPayment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/{id}")
    public SubcontractorPayment getPaymentById(
            @PathVariable Long id
    ) {
        return paymentService.getPaymentById(id);
    }

    @GetMapping("/project/{projectId}")
    public List<SubcontractorPayment> getByProject(
            @PathVariable Long projectId
    ) {
        return paymentService.getPaymentsByProject(projectId);
    }

    @GetMapping("/contractor/{contractorId}")
    public List<SubcontractorPayment> getByContractor(
            @PathVariable Long contractorId
    ) {
        return paymentService.getPaymentsByContractor(
                contractorId
        );
    }

    @GetMapping("/bill/{billId}")
    public List<SubcontractorPayment> getByBill(
            @PathVariable Long billId
    ) {
        return paymentService.getPaymentsByBill(billId);
    }

    @PostMapping
    public ResponseEntity<?> createPayment(
            @RequestBody SubcontractorPayment payment
    ) {
        try {

            SubcontractorPayment savedPayment =
                    paymentService.createPayment(payment);

            return ResponseEntity.ok(savedPayment);

        } catch (RuntimeException e) {

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

    @PostMapping("/{id}/upload-slip")
    public ResponseEntity<?> uploadPaymentSlip(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {

        try {

            if (file == null || file.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Please select a payment slip."
                                )
                        );
            }

            String originalFileName =
                    file.getOriginalFilename();

            String contentType =
                    file.getContentType();

            if (
                    contentType == null ||
                    !(
                            contentType.equals("application/pdf") ||
                            contentType.startsWith("image/")
                    )
            ) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Only PDF and image files are allowed."
                                )
                        );
            }

            String extension = "";

            if (
                    originalFileName != null &&
                    originalFileName.contains(".")
            ) {
                extension =
                        originalFileName.substring(
                                originalFileName.lastIndexOf(".")
                        );
            }

            String savedFileName =
                    UUID.randomUUID() + extension;

            Path uploadPath =
                    Paths.get(UPLOAD_DIR);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path destination =
                    uploadPath.resolve(savedFileName);

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

            SubcontractorPayment payment =
                    paymentService.attachSlip(
                            id,
                            originalFileName,
                            destination.toString()
                    );

            return ResponseEntity.ok(payment);

        } catch (IOException e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "message",
                                    "Unable to upload payment slip."
                            )
                    );

        } catch (RuntimeException e) {

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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePayment(
            @PathVariable Long id
    ) {
        try {

            paymentService.deletePayment(id);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Payment deleted successfully."
                    )
            );

        } catch (RuntimeException e) {

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