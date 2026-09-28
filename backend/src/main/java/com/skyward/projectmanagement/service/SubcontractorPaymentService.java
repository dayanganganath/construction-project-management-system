package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.Contractor;
import com.skyward.projectmanagement.entity.ContractorBill;
import com.skyward.projectmanagement.entity.SubcontractorPayment;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.ContractorBillRepository;
import com.skyward.projectmanagement.repository.ContractorRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import com.skyward.projectmanagement.repository.SubcontractorPaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SubcontractorPaymentService {

    private final SubcontractorPaymentRepository paymentRepository;
    private final ContractorRepository contractorRepository;
    private final ProjectRepository projectRepository;
    private final ContractorBillRepository contractorBillRepository;

    public SubcontractorPaymentService(
            SubcontractorPaymentRepository paymentRepository,
            ContractorRepository contractorRepository,
            ProjectRepository projectRepository,
            ContractorBillRepository contractorBillRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.contractorRepository = contractorRepository;
        this.projectRepository = projectRepository;
        this.contractorBillRepository = contractorBillRepository;
    }

    public List<SubcontractorPayment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public SubcontractorPayment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Payment not found.")
                );
    }

    public List<SubcontractorPayment> getPaymentsByProject(
            Long projectId
    ) {
        return paymentRepository.findByProjectId(projectId);
    }

    public List<SubcontractorPayment> getPaymentsByContractor(
            Long contractorId
    ) {
        return paymentRepository.findByContractorId(contractorId);
    }

    public List<SubcontractorPayment> getPaymentsByBill(
            Long billId
    ) {
        return paymentRepository.findByContractorBillId(billId);
    }

    @Transactional
    public SubcontractorPayment createPayment(
            SubcontractorPayment payment
    ) {

        if (payment.getAmount() == null ||
                payment.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException(
                    "Payment amount must be greater than zero."
            );
        }

        if (payment.getProject() == null ||
                payment.getProject().getId() == null) {
            throw new RuntimeException(
                    "Project is required."
            );
        }

        if (payment.getContractor() == null ||
                payment.getContractor().getId() == null) {
            throw new RuntimeException(
                    "Contractor is required."
            );
        }

        Project project = projectRepository.findById(
                payment.getProject().getId()
        ).orElseThrow(() ->
                new RuntimeException("Project not found.")
        );

        Contractor contractor = contractorRepository.findById(
                payment.getContractor().getId()
        ).orElseThrow(() ->
                new RuntimeException("Contractor not found.")
        );

        payment.setProject(project);
        payment.setContractor(contractor);

        if (
                payment.getContractorBill() != null &&
                payment.getContractorBill().getId() != null
        ) {

            ContractorBill bill =
                    contractorBillRepository.findById(
                            payment.getContractorBill().getId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Contractor bill not found."
                            )
                    );

            if (!bill.getProject().getId()
                    .equals(project.getId())) {
                throw new RuntimeException(
                        "Selected bill does not belong to this project."
                );
            }

            if (!bill.getContractor().getId()
                    .equals(contractor.getId())) {
                throw new RuntimeException(
                        "Selected bill does not belong to this contractor."
                );
            }

            BigDecimal currentPaid =
                    bill.getPaidAmount() != null
                            ? bill.getPaidAmount()
                            : BigDecimal.ZERO;

            BigDecimal newPaidAmount =
                    currentPaid.add(payment.getAmount());

            bill.setPaidAmount(newPaidAmount);

            contractorBillRepository.save(bill);

            payment.setContractorBill(bill);
        }

        return paymentRepository.save(payment);
    }

    public SubcontractorPayment attachSlip(
            Long paymentId,
            String originalFileName,
            String filePath
    ) {

        SubcontractorPayment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found."
                                )
                        );

        payment.setSlipFileName(originalFileName);
        payment.setSlipFilePath(filePath);

        return paymentRepository.save(payment);
    }

    public void deletePayment(Long id) {

        if (!paymentRepository.existsById(id)) {
            throw new RuntimeException(
                    "Payment not found."
            );
        }

        paymentRepository.deleteById(id);
    }
}