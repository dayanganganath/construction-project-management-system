package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.SubcontractorPayment;
import com.skyward.projectmanagement.service.SubcontractorPaymentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subcontractor-payments")
public class SubcontractorPaymentController {

    private final SubcontractorPaymentService paymentService;

    public SubcontractorPaymentController(
            SubcontractorPaymentService paymentService
    ) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public List<SubcontractorPayment> getAllPayments() {
        return paymentService.getAllPayments();
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
        return paymentService.getPaymentsByContractor(contractorId);
    }

    @PostMapping
    public SubcontractorPayment createPayment(
            @RequestBody SubcontractorPayment payment
    ) {
        return paymentService.createPayment(payment);
    }
}