package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.Contractor;
import com.skyward.projectmanagement.entity.ContractorBill;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.ContractorBillRepository;
import com.skyward.projectmanagement.repository.ContractorRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import com.skyward.projectmanagement.repository.SubcontractorPaymentRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ContractorBillService {

    private final ContractorBillRepository contractorBillRepository;
    private final ContractorRepository contractorRepository;
    private final ProjectRepository projectRepository;
    private final SubcontractorPaymentRepository paymentRepository;

    public ContractorBillService(
            ContractorBillRepository contractorBillRepository,
            ContractorRepository contractorRepository,
            ProjectRepository projectRepository,
            SubcontractorPaymentRepository paymentRepository
    ) {
        this.contractorBillRepository = contractorBillRepository;
        this.contractorRepository = contractorRepository;
        this.projectRepository = projectRepository;
        this.paymentRepository = paymentRepository;
    }

    public List<ContractorBill> getAllBills() {
        return contractorBillRepository.findAll();
    }

    public ContractorBill getBillById(Long id) {
        return contractorBillRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Contractor bill not found."
                        )
                );
    }

    public List<ContractorBill> getBillsByProject(
            Long projectId
    ) {
        return contractorBillRepository
                .findByProjectId(projectId);
    }

    public List<ContractorBill> getBillsByContractor(
            Long contractorId
    ) {
        return contractorBillRepository
                .findByContractorId(contractorId);
    }

    public ContractorBill createBill(
            ContractorBill bill
    ) {

        validateBillBasics(bill);

        Long projectId =
                bill.getProject().getId();

        Long contractorId =
                bill.getContractor().getId();

        Project project =
                projectRepository.findById(
                        projectId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Project not found."
                        )
                );

        Contractor contractor =
                contractorRepository.findById(
                        contractorId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Contractor not found."
                        )
                );

        bill.setProject(project);
        bill.setContractor(contractor);

        /*
         * A new bill cannot already be paid.
         * Paid amount must only change through
         * SubcontractorPaymentService.
         */
        bill.setPaidAmount(
                BigDecimal.ZERO
        );

        return contractorBillRepository.save(
                bill
        );
    }

    public ContractorBill updateBill(
            Long id,
            ContractorBill updatedBill
    ) {

        ContractorBill existingBill =
                getBillById(id);

        validateBillBasics(
                updatedBill
        );

        Long newProjectId =
                updatedBill
                        .getProject()
                        .getId();

        Long newContractorId =
                updatedBill
                        .getContractor()
                        .getId();

        /*
         * Do not allow moving an existing bill
         * to another project.
         */
        if (
                existingBill.getProject() == null
                        ||
                !existingBill
                        .getProject()
                        .getId()
                        .equals(
                                newProjectId
                        )
        ) {
            throw new RuntimeException(
                    "Project cannot be changed for an existing contractor bill."
            );
        }

        /*
         * Do not allow moving an existing bill
         * to another contractor.
         */
        if (
                existingBill.getContractor() == null
                        ||
                !existingBill
                        .getContractor()
                        .getId()
                        .equals(
                                newContractorId
                        )
        ) {
            throw new RuntimeException(
                    "Contractor cannot be changed for an existing contractor bill."
            );
        }

        Project project =
                projectRepository.findById(
                        newProjectId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Project not found."
                        )
                );

        Contractor contractor =
                contractorRepository.findById(
                        newContractorId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Contractor not found."
                        )
                );

        BigDecimal newNetPayable =
                calculateNetPayable(
                        updatedBill
                );

        BigDecimal alreadyPaid =
                safeAmount(
                        existingBill
                                .getPaidAmount()
                );

        /*
         * Example:
         *
         * Already paid = 100,000
         * New net payable = 80,000
         *
         * This must not be allowed.
         */
        if (
                newNetPayable.compareTo(
                        alreadyPaid
                ) < 0
        ) {
            throw new RuntimeException(
                    "Net payable cannot be less than the amount already paid."
            );
        }

        existingBill.setBillNumber(
                updatedBill.getBillNumber()
        );

        existingBill.setBillDate(
                updatedBill.getBillDate()
        );

        existingBill.setPeriodFrom(
                updatedBill.getPeriodFrom()
        );

        existingBill.setPeriodTo(
                updatedBill.getPeriodTo()
        );

        existingBill.setWorkDescription(
                updatedBill.getWorkDescription()
        );

        existingBill.setGrossAmount(
                safeAmount(
                        updatedBill
                                .getGrossAmount()
                )
        );

        existingBill.setRetention(
                safeAmount(
                        updatedBill
                                .getRetention()
                )
        );

        existingBill.setAdvanceRecovery(
                safeAmount(
                        updatedBill
                                .getAdvanceRecovery()
                )
        );

        existingBill.setOtherDeductions(
                safeAmount(
                        updatedBill
                                .getOtherDeductions()
                )
        );

        /*
         * IMPORTANT:
         * Do not copy paidAmount from request.
         *
         * Keep actual payment-generated value.
         */
        existingBill.setPaidAmount(
                alreadyPaid
        );

        existingBill.setProject(
                project
        );

        existingBill.setContractor(
                contractor
        );

        return contractorBillRepository.save(
                existingBill
        );
    }

    public void deleteBill(
            Long id
    ) {

        ContractorBill bill =
                getBillById(id);

        boolean hasPayments =
                !paymentRepository
                        .findByContractorBillId(
                                bill.getId()
                        )
                        .isEmpty();

        if (hasPayments) {
            throw new RuntimeException(
                    "This bill cannot be deleted because payments are linked to it."
            );
        }

        contractorBillRepository.delete(
                bill
        );
    }

    private void validateBillBasics(
            ContractorBill bill
    ) {

        if (bill == null) {
            throw new RuntimeException(
                    "Contractor bill is required."
            );
        }

        if (
                bill.getBillNumber() == null
                        ||
                bill.getBillNumber()
                        .trim()
                        .isEmpty()
        ) {
            throw new RuntimeException(
                    "Bill number is required."
            );
        }

        if (
                bill.getProject() == null
                        ||
                bill.getProject()
                        .getId() == null
        ) {
            throw new RuntimeException(
                    "Project is required."
            );
        }

        if (
                bill.getContractor() == null
                        ||
                bill.getContractor()
                        .getId() == null
        ) {
            throw new RuntimeException(
                    "Contractor is required."
            );
        }

        BigDecimal grossAmount =
                safeAmount(
                        bill.getGrossAmount()
                );

        if (
                grossAmount.compareTo(
                        BigDecimal.ZERO
                ) < 0
        ) {
            throw new RuntimeException(
                    "Gross amount cannot be negative."
            );
        }

        BigDecimal netPayable =
                calculateNetPayable(
                        bill
                );

        if (
                netPayable.compareTo(
                        BigDecimal.ZERO
                ) < 0
        ) {
            throw new RuntimeException(
                    "Deductions cannot exceed the gross amount."
            );
        }
    }

    private BigDecimal calculateNetPayable(
            ContractorBill bill
    ) {

        BigDecimal gross =
                safeAmount(
                        bill.getGrossAmount()
                );

        BigDecimal retention =
                safeAmount(
                        bill.getRetention()
                );

        BigDecimal advanceRecovery =
                safeAmount(
                        bill.getAdvanceRecovery()
                );

        BigDecimal otherDeductions =
                safeAmount(
                        bill.getOtherDeductions()
                );

        return gross
                .subtract(retention)
                .subtract(advanceRecovery)
                .subtract(otherDeductions);
    }

    private BigDecimal safeAmount(
            BigDecimal value
    ) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }
}