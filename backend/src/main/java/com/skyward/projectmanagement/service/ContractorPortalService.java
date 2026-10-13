package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.Contractor;
import com.skyward.projectmanagement.entity.ContractorBill;
import com.skyward.projectmanagement.entity.SubcontractorPayment;
import com.skyward.projectmanagement.model.Project;

import com.skyward.projectmanagement.repository.ContractorBillRepository;
import com.skyward.projectmanagement.repository.ContractorRepository;
import com.skyward.projectmanagement.repository.SubcontractorPaymentRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ContractorPortalService {

    private final ContractorRepository
            contractorRepository;

    private final ContractorBillRepository
            contractorBillRepository;

    private final SubcontractorPaymentRepository
            paymentRepository;

    private final ContractorProjectAssignmentService
            assignmentService;

    public ContractorPortalService(
            ContractorRepository contractorRepository,
            ContractorBillRepository contractorBillRepository,
            SubcontractorPaymentRepository paymentRepository,
            ContractorProjectAssignmentService assignmentService
    ) {
        this.contractorRepository =
                contractorRepository;

        this.contractorBillRepository =
                contractorBillRepository;

        this.paymentRepository =
                paymentRepository;

        this.assignmentService =
                assignmentService;
    }

    public Map<String, Object>
    getMyProfile(
            String username
    ) {

        Contractor contractor =
                getContractor(
                        username
                );

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                contractor.getId()
        );

        response.put(
                "name",
                contractor.getName()
        );

        response.put(
                "type",
                contractor.getType()
        );

        response.put(
                "tradeType",
                contractor.getTradeType()
        );

        response.put(
                "phone",
                contractor.getPhone()
        );

        response.put(
                "address",
                contractor.getAddress()
        );

        response.put(
                "nicOrRegistrationNo",
                contractor.getNicOrRegistrationNo()
        );

        response.put(
                "bankName",
                contractor.getBankName()
        );

        response.put(
                "bankAccountName",
                contractor.getBankAccountName()
        );

        response.put(
                "bankAccountNumber",
                contractor.getBankAccountNumber()
        );

        response.put(
                "active",
                contractor.getActive()
        );

        response.put(
                "username",
                username
        );

        return response;
    }

    public List<Map<String, Object>>
    getMyProjects(
            String username
    ) {

        Contractor contractor =
                getContractor(
                        username
                );

        List<Project> projects =
                assignmentService
                        .getAssignedProjects(
                                contractor.getId()
                        );

        return projects
                .stream()
                .map(
                        this::toProjectResponse
                )
                .collect(
                        Collectors.toList()
                );
    }

    public List<Map<String, Object>>
    getMyBills(
            String username
    ) {

        Contractor contractor =
                getContractor(
                        username
                );

        return contractorBillRepository
                .findByContractorId(
                        contractor.getId()
                )
                .stream()
                .sorted(
                        Comparator.comparing(
                                ContractorBill::getBillDate,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder()
                                )
                        )
                )
                .map(
                        this::toBillResponse
                )
                .collect(
                        Collectors.toList()
                );
    }

    public List<Map<String, Object>>
    getMyPayments(
            String username
    ) {

        Contractor contractor =
                getContractor(
                        username
                );

        return paymentRepository
                .findByContractorId(
                        contractor.getId()
                )
                .stream()
                .sorted(
                        Comparator.comparing(
                                SubcontractorPayment::getPaymentDate,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder()
                                )
                        )
                )
                .map(
                        this::toPaymentResponse
                )
                .collect(
                        Collectors.toList()
                );
    }

    public Map<String, Object>
    getDashboard(
            String username
    ) {

        Contractor contractor =
                getContractor(
                        username
                );

        List<ContractorBill> bills =
                contractorBillRepository
                        .findByContractorId(
                                contractor.getId()
                        );

        List<SubcontractorPayment> payments =
                paymentRepository
                        .findByContractorId(
                                contractor.getId()
                        );

        List<Project> assignedProjects =
                assignmentService
                        .getAssignedProjects(
                                contractor.getId()
                        );

        BigDecimal totalGross =
                bills.stream()
                        .map(
                                ContractorBill::getGrossAmount
                        )
                        .filter(
                                Objects::nonNull
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalNetPayable =
                bills.stream()
                        .map(
                                ContractorBill::getNetPayable
                        )
                        .filter(
                                Objects::nonNull
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalPaid =
                payments.stream()
                        .map(
                                SubcontractorPayment::getAmount
                        )
                        .filter(
                                Objects::nonNull
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal outstanding =
                bills.stream()
                        .map(
                                ContractorBill::getBalanceAmount
                        )
                        .filter(
                                Objects::nonNull
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        long unpaidBills =
                bills.stream()
                        .filter(
                                bill ->
                                        !"PAID".equalsIgnoreCase(
                                                bill.getStatus()
                                        )
                        )
                        .count();

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "contractorId",
                contractor.getId()
        );

        response.put(
                "contractorName",
                contractor.getName()
        );

        response.put(
                "totalProjects",
                assignedProjects.size()
        );

        response.put(
                "totalBills",
                bills.size()
        );

        response.put(
                "unpaidBills",
                unpaidBills
        );

        response.put(
                "totalGrossAmount",
                totalGross
        );

        response.put(
                "totalNetPayable",
                totalNetPayable
        );

        response.put(
                "totalPaid",
                totalPaid
        );

        response.put(
                "outstandingBalance",
                outstanding
        );

        return response;
    }

    private Contractor
    getContractor(
            String username
    ) {

        Contractor contractor =
                contractorRepository
                        .findByUserUsername(
                                username
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Contractor account is not linked."
                                        )
                        );

        if (
                !Boolean.TRUE.equals(
                        contractor.getActive()
                )
        ) {
            throw new RuntimeException(
                    "Contractor account is inactive."
            );
        }

        if (
                contractor.getUser() == null
                        ||
                !Boolean.TRUE.equals(
                        contractor
                                .getUser()
                                .getActive()
                )
        ) {
            throw new RuntimeException(
                    "Contractor login account is inactive."
            );
        }

        return contractor;
    }

    private Map<String, Object>
    toProjectResponse(
            Project project
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                project.getId()
        );

        response.put(
                "projectName",
                project.getProjectName()
        );

        response.put(
                "location",
                project.getLocation()
        );

        response.put(
                "description",
                project.getDescription()
        );

        response.put(
                "startDate",
                project.getStartDate()
        );

        response.put(
                "endDate",
                project.getEndDate()
        );

        response.put(
                "status",
                project.getStatus()
        );

        return response;
    }

    private Map<String, Object>
    toBillResponse(
            ContractorBill bill
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                bill.getId()
        );

        response.put(
                "billNumber",
                bill.getBillNumber()
        );

        response.put(
                "billDate",
                bill.getBillDate()
        );

        response.put(
                "periodFrom",
                bill.getPeriodFrom()
        );

        response.put(
                "periodTo",
                bill.getPeriodTo()
        );

        response.put(
                "workDescription",
                bill.getWorkDescription()
        );

        response.put(
                "grossAmount",
                bill.getGrossAmount()
        );

        response.put(
                "retention",
                bill.getRetention()
        );

        response.put(
                "advanceRecovery",
                bill.getAdvanceRecovery()
        );

        response.put(
                "otherDeductions",
                bill.getOtherDeductions()
        );

        response.put(
                "netPayable",
                bill.getNetPayable()
        );

        response.put(
                "paidAmount",
                bill.getPaidAmount()
        );

        response.put(
                "balanceAmount",
                bill.getBalanceAmount()
        );

        response.put(
                "status",
                bill.getStatus()
        );

        if (
                bill.getProject() != null
        ) {

            response.put(
                    "projectId",
                    bill.getProject()
                            .getId()
            );

            response.put(
                    "projectName",
                    bill.getProject()
                            .getProjectName()
            );
        }

        return response;
    }

    private Map<String, Object>
    toPaymentResponse(
            SubcontractorPayment payment
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                payment.getId()
        );

        response.put(
                "amount",
                payment.getAmount()
        );

        response.put(
                "paymentDate",
                payment.getPaymentDate()
        );

        response.put(
                "paymentMethod",
                payment.getPaymentMethod()
        );

        response.put(
                "referenceNumber",
                payment.getReferenceNumber()
        );

        response.put(
                "notes",
                payment.getNotes()
        );

        response.put(
                "slipFileName",
                payment.getSlipFileName()
        );

        if (
                payment.getProject() != null
        ) {

            response.put(
                    "projectId",
                    payment.getProject()
                            .getId()
            );

            response.put(
                    "projectName",
                    payment.getProject()
                            .getProjectName()
            );
        }

        if (
                payment.getContractorBill() != null
        ) {

            response.put(
                    "billId",
                    payment
                            .getContractorBill()
                            .getId()
            );

            response.put(
                    "billNumber",
                    payment
                            .getContractorBill()
                            .getBillNumber()
            );
        }

        return response;
    }
}