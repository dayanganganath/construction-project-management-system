package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.model.Payment;
import com.skyward.projectmanagement.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody Payment payment) {
        try {
            return ResponseEntity.ok(paymentService.createPayment(payment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePayment(
            @PathVariable Long id,
            @RequestBody Payment updatedPayment) {

        try {
            return ResponseEntity.ok(
                    paymentService.updatePayment(id, updatedPayment)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {

        if (paymentService.getPaymentById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}