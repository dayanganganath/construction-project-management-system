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

    public List<SubcontractorPayment> getPaymentsByProject(Long projectId) {
        return paymentRepository.findByProjectId(projectId);
    }

    public List<SubcontractorPayment> getPaymentsByContractor(Long contractorId) {
        return paymentRepository.findByContractorId(contractorId);
    }

    @Transactional
    public SubcontractorPayment createPayment(
            SubcontractorPayment payment
    ) {
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

        if (payment.getContractorBill() != null) {

            ContractorBill bill = contractorBillRepository.findById(
                    payment.getContractorBill().getId()
            ).orElseThrow(() ->
                    new RuntimeException("Contractor bill not found.")
            );

            if (!bill.getProject().getId().equals(project.getId())) {
                throw new RuntimeException(
                        "Selected bill does not belong to this project."
                );
            }

            if (!bill.getContractor().getId().equals(contractor.getId())) {
                throw new RuntimeException(
                        "Selected bill does not belong to this contractor."
                );
            }

            BigDecimal currentPaid =
                    bill.getPaidAmount() != null
                            ? bill.getPaidAmount()
                            : BigDecimal.ZERO;

            BigDecimal paymentAmount =
                    payment.getAmount() != null
                            ? payment.getAmount()
                            : BigDecimal.ZERO;

            bill.setPaidAmount(
                    currentPaid.add(paymentAmount)
            );

            contractorBillRepository.save(bill);

            payment.setContractorBill(bill);
        }

        return paymentRepository.save(payment);
    }
}