package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.dto.SiteCostSummaryDto;
import com.skyward.projectmanagement.entity.ContractorBill;
import com.skyward.projectmanagement.entity.LabourPayment;
import com.skyward.projectmanagement.entity.SubcontractorPayment;
import com.skyward.projectmanagement.model.Project;

import com.skyward.projectmanagement.repository.ContractorBillRepository;
import com.skyward.projectmanagement.repository.LabourPaymentRepository;
import com.skyward.projectmanagement.repository.PaymentRepository;
import com.skyward.projectmanagement.repository.ProjectExpenseRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import com.skyward.projectmanagement.repository.SubcontractorPaymentRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SiteCostSummaryService {

    private final ProjectRepository projectRepository;

    private final ContractorBillRepository contractorBillRepository;

    private final SubcontractorPaymentRepository subcontractorPaymentRepository;

    private final LabourPaymentRepository labourPaymentRepository;

    private final ProjectExpenseRepository projectExpenseRepository;

    private final PaymentRepository paymentRepository;

    public SiteCostSummaryService(
            ProjectRepository projectRepository,
            ContractorBillRepository contractorBillRepository,
            SubcontractorPaymentRepository subcontractorPaymentRepository,
            LabourPaymentRepository labourPaymentRepository,
            ProjectExpenseRepository projectExpenseRepository,
            PaymentRepository paymentRepository
    ) {
        this.projectRepository =
                projectRepository;

        this.contractorBillRepository =
                contractorBillRepository;

        this.subcontractorPaymentRepository =
                subcontractorPaymentRepository;

        this.labourPaymentRepository =
                labourPaymentRepository;

        this.projectExpenseRepository =
                projectExpenseRepository;

        this.paymentRepository =
                paymentRepository;
    }

    public SiteCostSummaryDto getProjectSummary(
            Long projectId
    ) {

        Project project =
                projectRepository
                        .findById(projectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found."
                                )
                        );

        SiteCostSummaryDto summary =
                new SiteCostSummaryDto();

        summary.setProjectId(
                project.getId()
        );

        summary.setProjectName(
                project.getProjectName()
        );

        summary.setLocation(
                project.getLocation()
        );

        /*
         * =====================================================
         * CONTRACTOR BILLS
         * =====================================================
         */

        List<ContractorBill> bills =
                contractorBillRepository
                        .findByProjectId(projectId);

        BigDecimal contractorGross =
                BigDecimal.ZERO;

        BigDecimal contractorNetPayable =
                BigDecimal.ZERO;

        BigDecimal contractorPaid =
                BigDecimal.ZERO;

        BigDecimal contractorOutstanding =
                BigDecimal.ZERO;

        int unpaidBills = 0;
        int partiallyPaidBills = 0;
        int paidBills = 0;

        for (ContractorBill bill : bills) {

            contractorGross =
                    contractorGross.add(
                            safeAmount(
                                    bill.getGrossAmount()
                            )
                    );

            contractorNetPayable =
                    contractorNetPayable.add(
                            safeAmount(
                                    bill.getNetPayable()
                            )
                    );

            contractorPaid =
                    contractorPaid.add(
                            safeAmount(
                                    bill.getPaidAmount()
                            )
                    );

            contractorOutstanding =
                    contractorOutstanding.add(
                            safeAmount(
                                    bill.getBalanceAmount()
                            )
                    );

            String status =
                    bill.getStatus();

            if (
                    "PAID".equalsIgnoreCase(
                            status
                    )
            ) {
                paidBills++;

            } else if (
                    "PARTIALLY_PAID"
                            .equalsIgnoreCase(
                                    status
                            )
            ) {
                partiallyPaidBills++;

            } else {
                unpaidBills++;
            }
        }

        summary.setTotalContractorBills(
                bills.size()
        );

        summary.setPaidBills(
                paidBills
        );

        summary.setPartiallyPaidBills(
                partiallyPaidBills
        );

        summary.setUnpaidBills(
                unpaidBills
        );

        summary.setContractorGrossAmount(
                contractorGross
        );

        summary.setContractorNetPayable(
                contractorNetPayable
        );

        summary.setContractorPaidAmount(
                contractorPaid
        );

        summary.setContractorOutstandingAmount(
                contractorOutstanding
        );

        /*
         * =====================================================
         * SUBCONTRACTOR PAYMENTS
         * =====================================================
         */

        List<SubcontractorPayment>
                subcontractorPayments =
                subcontractorPaymentRepository
                        .findByProjectId(projectId);

        BigDecimal subcontractorPaymentTotal =
                BigDecimal.ZERO;

        for (
                SubcontractorPayment payment :
                subcontractorPayments
        ) {

            subcontractorPaymentTotal =
                    subcontractorPaymentTotal.add(
                            safeAmount(
                                    payment.getAmount()
                            )
                    );
        }

        summary.setSubcontractorPayments(
                subcontractorPaymentTotal
        );

        /*
         * =====================================================
         * LABOUR PAYMENTS
         * =====================================================
         *
         * Only PAID labour payments are treated
         * as real outgoing cash.
         */

        List<LabourPayment> labourPayments =
                labourPaymentRepository
                        .findByProjectId(projectId);

        BigDecimal labourPaymentTotal =
                BigDecimal.ZERO;

        for (
                LabourPayment payment :
                labourPayments
        ) {

            if (
                    payment.getStatus()
                            == LabourPayment
                            .PaymentStatus
                            .PAID
            ) {

                labourPaymentTotal =
                        labourPaymentTotal.add(
                                safeAmount(
                                        payment.getAmount()
                                )
                        );
            }
        }

        summary.setLabourPayments(
                labourPaymentTotal
        );

        /*
         * =====================================================
         * PROJECT EXPENSES
         * =====================================================
         */

        BigDecimal expenseTotal =
                BigDecimal.ZERO;

        for (
                var expense :
                projectExpenseRepository
                        .findByProjectId(
                                projectId
                        )
        ) {

            expenseTotal =
                    expenseTotal.add(
                            safeAmount(
                                    expense.getAmount()
                            )
                    );
        }

        summary.setProjectExpenses(
                expenseTotal
        );

        /*
         * =====================================================
         * CLIENT PAYMENTS
         * =====================================================
         */

        BigDecimal clientPaymentTotal =
                BigDecimal.ZERO;

        for (
                var payment :
                paymentRepository.findAll()
        ) {

            if (
                    payment.getProject()
                            != null
                            &&
                    payment.getProject()
                            .getId()
                            != null
                            &&
                    payment.getProject()
                            .getId()
                            .equals(
                                    projectId
                            )
            ) {

                clientPaymentTotal =
                        clientPaymentTotal.add(
                                safeAmount(
                                        payment.getAmount()
                                )
                        );
            }
        }

        summary.setClientPayments(
                clientPaymentTotal
        );

        /*
         * =====================================================
         * CASH POSITION
         * =====================================================
         *
         * Contractor paid amount is NOT added again because
         * subcontractor payments already represent actual
         * outgoing payments.
         *
         * Labour payments ARE added separately.
         */

        BigDecimal totalOutgoing =
                subcontractorPaymentTotal
                        .add(
                                labourPaymentTotal
                        )
                        .add(
                                expenseTotal
                        );

        BigDecimal netCashPosition =
                clientPaymentTotal
                        .subtract(
                                totalOutgoing
                        );

        summary.setTotalOutgoing(
                totalOutgoing
        );

        summary.setNetCashPosition(
                netCashPosition
        );

        return summary;
    }

    private BigDecimal safeAmount(
            BigDecimal value
    ) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }
}