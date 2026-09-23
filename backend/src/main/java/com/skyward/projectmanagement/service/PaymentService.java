package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.model.Payment;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.PaymentRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ProjectRepository projectRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          ProjectRepository projectRepository) {
        this.paymentRepository = paymentRepository;
        this.projectRepository = projectRepository;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    public Payment createPayment(Payment payment) {

        if (payment.getProject() == null || payment.getProject().getId() == null) {
            throw new RuntimeException("Project ID is required");
        }

        Project project = projectRepository
                .findById(payment.getProject().getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        payment.setProject(project);

        return paymentRepository.save(payment);
    }

    public Payment updatePayment(Long id, Payment updatedPayment) {

        return paymentRepository.findById(id)
                .map(payment -> {

                    payment.setAmount(updatedPayment.getAmount());
                    payment.setPaymentDate(updatedPayment.getPaymentDate());
                    payment.setPaymentMethod(updatedPayment.getPaymentMethod());
                    payment.setReferenceNumber(updatedPayment.getReferenceNumber());
                    payment.setNotes(updatedPayment.getNotes());

                    if (updatedPayment.getProject() != null
                            && updatedPayment.getProject().getId() != null) {

                        Project project = projectRepository
                                .findById(updatedPayment.getProject().getId())
                                .orElseThrow(() -> new RuntimeException("Project not found"));

                        payment.setProject(project);
                    }

                    return paymentRepository.save(payment);
                })
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public void deletePayment(Long id) {
        paymentRepository.deleteById(id);
    }
}