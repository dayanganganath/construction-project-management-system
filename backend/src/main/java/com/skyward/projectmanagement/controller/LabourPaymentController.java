package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.LabourPayment;
import com.skyward.projectmanagement.service.LabourPaymentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/labour-payments")
@CrossOrigin(origins = "http://localhost:5173")
public class LabourPaymentController {

    private final LabourPaymentService labourPaymentService;

    public LabourPaymentController(
            LabourPaymentService labourPaymentService
    ) {
        this.labourPaymentService =
                labourPaymentService;
    }

    @GetMapping
    public List<LabourPayment> getAll() {
        return labourPaymentService
                .getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(
                    labourPaymentService
                            .getById(id)
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/project/{projectId}")
    public List<LabourPayment> getByProject(
            @PathVariable Long projectId
    ) {
        return labourPaymentService
                .getByProject(projectId);
    }

    @GetMapping("/worker/{workerId}")
    public List<LabourPayment> getByWorker(
            @PathVariable Long workerId
    ) {
        return labourPaymentService
                .getByWorker(workerId);
    }

    @GetMapping("/date/{date}")
    public List<LabourPayment> getByDate(
            @PathVariable LocalDate date
    ) {
        return labourPaymentService
                .getByDate(date);
    }

    @GetMapping(
            "/project/{projectId}/date/{date}"
    )
    public List<LabourPayment>
    getByProjectAndDate(
            @PathVariable Long projectId,
            @PathVariable LocalDate date
    ) {
        return labourPaymentService
                .getByProjectAndDate(
                        projectId,
                        date
                );
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody LabourPayment payment
    ) {
        try {
            return ResponseEntity.ok(
                    labourPaymentService
                            .create(payment)
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody LabourPayment payment
    ) {
        try {
            return ResponseEntity.ok(
                    labourPaymentService
                            .update(
                                    id,
                                    payment
                            )
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id
    ) {
        try {
            labourPaymentService
                    .delete(id);

            return ResponseEntity
                    .noContent()
                    .build();
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}