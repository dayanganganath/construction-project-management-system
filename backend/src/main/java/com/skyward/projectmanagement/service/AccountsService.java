package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.dto.PaymentRegisterItem;
import com.skyward.projectmanagement.entity.LabourPayment;
import com.skyward.projectmanagement.entity.SubcontractorPayment;

import com.skyward.projectmanagement.repository.LabourPaymentRepository;
import com.skyward.projectmanagement.repository.PaymentRepository;
import com.skyward.projectmanagement.repository.ProjectExpenseRepository;
import com.skyward.projectmanagement.repository.SubcontractorPaymentRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AccountsService {

    private final PaymentRepository paymentRepository;

    private final ProjectExpenseRepository projectExpenseRepository;

    private final SubcontractorPaymentRepository subcontractorPaymentRepository;

    private final LabourPaymentRepository labourPaymentRepository;

    public AccountsService(
            PaymentRepository paymentRepository,
            ProjectExpenseRepository projectExpenseRepository,
            SubcontractorPaymentRepository subcontractorPaymentRepository,
            LabourPaymentRepository labourPaymentRepository
    ) {

        this.paymentRepository =
                paymentRepository;

        this.projectExpenseRepository =
                projectExpenseRepository;

        this.subcontractorPaymentRepository =
                subcontractorPaymentRepository;

        this.labourPaymentRepository =
                labourPaymentRepository;
    }

    public List<PaymentRegisterItem> getPaymentRegister(
            LocalDate from,
            LocalDate to,
            Long projectId,
            String type,
            String search
    ) {

        List<PaymentRegisterItem> register =
                new ArrayList<>();

        /*
         * =========================================================
         * CLIENT PAYMENTS
         * Money received by the company
         * =========================================================
         */

        for (
                var payment :
                paymentRepository.findAll()
        ) {

            Long paymentProjectId =
                    null;

            String projectName =
                    null;

            String location =
                    null;

            String clientName =
                    "Client";

            if (
                    payment.getProject()
                            != null
            ) {

                paymentProjectId =
                        payment.getProject()
                                .getId();

                projectName =
                        payment.getProject()
                                .getProjectName();

                location =
                        payment.getProject()
                                .getLocation();

                if (
                        payment.getProject()
                                .getClient()
                                != null
                                &&
                        payment.getProject()
                                .getClient()
                                .getName()
                                != null
                ) {

                    clientName =
                            payment.getProject()
                                    .getClient()
                                    .getName();
                }
            }

            PaymentRegisterItem item =
                    new PaymentRegisterItem(
                            payment.getId(),

                            "CLIENT_PAYMENT",

                            payment.getPaymentDate(),

                            paymentProjectId,

                            projectName,

                            location,

                            clientName,

                            payment.getNotes(),

                            "Client Payment",

                            payment.getPaymentMethod(),

                            payment.getReferenceNumber(),

                            payment.getAmount(),

                            "IN",

                            null
                    );

            register.add(item);
        }

        /*
         * =========================================================
         * SUBCONTRACTOR PAYMENTS
         * Money paid out to subcontractors
         * =========================================================
         */

        for (
                SubcontractorPayment payment :
                subcontractorPaymentRepository
                        .findAll()
        ) {

            Long paymentProjectId =
                    null;

            String projectName =
                    null;

            String location =
                    null;

            String contractorName =
                    "Other / Unmatched";

            if (
                    payment.getProject()
                            != null
            ) {

                paymentProjectId =
                        payment.getProject()
                                .getId();

                projectName =
                        payment.getProject()
                                .getProjectName();

                location =
                        payment.getProject()
                                .getLocation();
            }

            if (
                    payment.getContractor()
                            != null
                            &&
                    payment.getContractor()
                            .getName()
                            != null
            ) {

                contractorName =
                        payment.getContractor()
                                .getName();
            }

            PaymentRegisterItem item =
                    new PaymentRegisterItem(
                            payment.getId(),

                            "SUBCONTRACTOR_PAYMENT",

                            payment.getPaymentDate(),

                            paymentProjectId,

                            projectName,

                            location,

                            contractorName,

                            payment.getNotes(),

                            "Subcontractor Payment",

                            payment.getPaymentMethod(),

                            payment.getReferenceNumber(),

                            payment.getAmount(),

                            "OUT",

                            payment.getSlipFileName()
                    );

            register.add(item);
        }

        /*
         * =========================================================
         * LABOUR PAYMENTS
         * Actual daily worker payments
         * =========================================================
         *
         * Only PAID entries are treated as transactions.
         * PENDING entries are not cash movement yet.
         */

        for (
                LabourPayment payment :
                labourPaymentRepository
                        .findAll()
        ) {

            if (
                    payment.getStatus()
                            != LabourPayment
                            .PaymentStatus
                            .PAID
            ) {
                continue;
            }

            Long paymentProjectId =
                    null;

            String projectName =
                    null;

            String location =
                    null;

            String workerName =
                    "Worker";

            if (
                    payment.getProject()
                            != null
            ) {

                paymentProjectId =
                        payment.getProject()
                                .getId();

                projectName =
                        payment.getProject()
                                .getProjectName();

                location =
                        payment.getProject()
                                .getLocation();
            }

            if (
                    payment.getWorker()
                            != null
                            &&
                    payment.getWorker()
                            .getName()
                            != null
            ) {

                workerName =
                        payment.getWorker()
                                .getName();
            }

            PaymentRegisterItem item =
                    new PaymentRegisterItem(
                            payment.getId(),

                            "LABOUR_PAYMENT",

                            payment.getPaymentDate(),

                            paymentProjectId,

                            projectName,

                            location,

                            workerName,

                            payment.getNotes(),

                            "Daily Labour Payment",

                            payment.getPaymentMethod()
                                    != null
                                    ? payment
                                    .getPaymentMethod()
                                    .name()
                                    : null,

                            payment.getReference(),

                            payment.getAmount(),

                            "OUT",

                            null
                    );

            register.add(item);
        }

        /*
         * =========================================================
         * PROJECT EXPENSES
         * General project / site expenses
         * =========================================================
         */

        for (
                var expense :
                projectExpenseRepository
                        .findAll()
        ) {

            Long expenseProjectId =
                    null;

            String projectName =
                    null;

            String location =
                    null;

            if (
                    expense.getProject()
                            != null
            ) {

                expenseProjectId =
                        expense.getProject()
                                .getId();

                projectName =
                        expense.getProject()
                                .getProjectName();

                location =
                        expense.getProject()
                                .getLocation();
            }

            String partyName =
                    expense.getExpenseType()
                            != null
                            ? expense.getExpenseType()
                            : "Project Expense";

            PaymentRegisterItem item =
                    new PaymentRegisterItem(
                            expense.getId(),

                            "EXPENSE",

                            expense.getDate(),

                            expenseProjectId,

                            projectName,

                            location,

                            partyName,

                            expense.getDescription(),

                            expense.getExpenseType(),

                            null,

                            null,

                            expense.getAmount(),

                            "OUT",

                            null
                    );

            register.add(item);
        }

        /*
         * =========================================================
         * FILTERS
         * =========================================================
         */

        return register
                .stream()

                /*
                 * FROM DATE
                 */
                .filter(item ->
                        from == null
                                ||
                        item.getDate() == null
                                ||
                        !item.getDate()
                                .isBefore(from)
                )

                /*
                 * TO DATE
                 */
                .filter(item ->
                        to == null
                                ||
                        item.getDate() == null
                                ||
                        !item.getDate()
                                .isAfter(to)
                )

                /*
                 * PROJECT / SITE
                 */
                .filter(item ->
                        projectId == null
                                ||
                        projectId.equals(
                                item.getProjectId()
                        )
                )

                /*
                 * PAYMENT TYPE
                 */
                .filter(item ->
                        type == null
                                ||
                        type.isBlank()
                                ||
                        "ALL"
                                .equalsIgnoreCase(type)
                                ||
                        type.equalsIgnoreCase(
                                item.getSourceType()
                        )
                )

                /*
                 * SEARCH
                 */
                .filter(item ->
                        matchesSearch(
                                item,
                                search
                        )
                )

                /*
                 * NEWEST FIRST
                 */
                .sorted(
                        Comparator.comparing(
                                PaymentRegisterItem::getDate,

                                Comparator.nullsLast(
                                        Comparator
                                                .reverseOrder()
                                )
                        )
                )

                .toList();
    }

    /*
     * =============================================================
     * SUMMARY
     * =============================================================
     */

    public Map<String, Object> getSummary(
            LocalDate from,
            LocalDate to,
            Long projectId,
            String type,
            String search
    ) {

        List<PaymentRegisterItem> register =
                getPaymentRegister(
                        from,
                        to,
                        projectId,
                        type,
                        search
                );

        BigDecimal totalReceived =
                BigDecimal.ZERO;

        BigDecimal totalSubcontractorPayments =
                BigDecimal.ZERO;

        BigDecimal totalLabourPayments =
                BigDecimal.ZERO;

        BigDecimal totalExpenses =
                BigDecimal.ZERO;

        BigDecimal totalOutgoing =
                BigDecimal.ZERO;

        for (
                PaymentRegisterItem item :
                register
        ) {

            BigDecimal amount =
                    item.getAmount() == null
                            ? BigDecimal.ZERO
                            : item.getAmount();

            /*
             * CLIENT MONEY RECEIVED
             */
            if (
                    "CLIENT_PAYMENT"
                            .equalsIgnoreCase(
                                    item.getSourceType()
                            )
            ) {

                totalReceived =
                        totalReceived.add(
                                amount
                        );
            }

            /*
             * SUBCONTRACTOR PAYMENT
             */
            if (
                    "SUBCONTRACTOR_PAYMENT"
                            .equalsIgnoreCase(
                                    item.getSourceType()
                            )
            ) {

                totalSubcontractorPayments =
                        totalSubcontractorPayments
                                .add(amount);
            }

            /*
             * LABOUR PAYMENT
             */
            if (
                    "LABOUR_PAYMENT"
                            .equalsIgnoreCase(
                                    item.getSourceType()
                            )
            ) {

                totalLabourPayments =
                        totalLabourPayments
                                .add(amount);
            }

            /*
             * GENERAL EXPENSE
             */
            if (
                    "EXPENSE"
                            .equalsIgnoreCase(
                                    item.getSourceType()
                            )
            ) {

                totalExpenses =
                        totalExpenses.add(
                                amount
                        );
            }

            /*
             * ALL MONEY OUT
             */
            if (
                    "OUT"
                            .equalsIgnoreCase(
                                    item.getDirection()
                            )
            ) {

                totalOutgoing =
                        totalOutgoing.add(
                                amount
                        );
            }
        }

        BigDecimal netCashFlow =
                totalReceived.subtract(
                        totalOutgoing
                );

        Map<String, Object> summary =
                new LinkedHashMap<>();

        summary.put(
                "transactionCount",
                register.size()
        );

        summary.put(
                "totalReceived",
                totalReceived
        );

        summary.put(
                "totalSubcontractorPayments",
                totalSubcontractorPayments
        );

        summary.put(
                "totalLabourPayments",
                totalLabourPayments
        );

        summary.put(
                "totalExpenses",
                totalExpenses
        );

        summary.put(
                "totalOutgoing",
                totalOutgoing
        );

        summary.put(
                "netCashFlow",
                netCashFlow
        );

        return summary;
    }

    /*
     * =============================================================
     * SEARCH
     * =============================================================
     */

    private boolean matchesSearch(
            PaymentRegisterItem item,
            String search
    ) {

        if (
                search == null
                        ||
                search.isBlank()
        ) {

            return true;
        }

        String keyword =
                search
                        .toLowerCase()
                        .trim();

        return contains(
                item.getPartyName(),
                keyword
        )
                ||
                contains(
                        item.getProjectName(),
                        keyword
                )
                ||
                contains(
                        item.getLocation(),
                        keyword
                )
                ||
                contains(
                        item.getDescription(),
                        keyword
                )
                ||
                contains(
                        item.getReferenceNumber(),
                        keyword
                )
                ||
                contains(
                        item.getCategory(),
                        keyword
                )
                ||
                contains(
                        item.getSourceType(),
                        keyword
                );
    }

    private boolean contains(
            String value,
            String keyword
    ) {

        return value != null
                &&
                value
                        .toLowerCase()
                        .contains(
                                keyword
                        );
    }
}