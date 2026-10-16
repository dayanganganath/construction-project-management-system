package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.Contractor;
import com.skyward.projectmanagement.entity.ContractorBill;
import com.skyward.projectmanagement.entity.ProjectDocument;
import com.skyward.projectmanagement.entity.SubcontractorPayment;
import com.skyward.projectmanagement.model.Project;

import com.skyward.projectmanagement.repository.ContractorBillRepository;
import com.skyward.projectmanagement.repository.ContractorRepository;
import com.skyward.projectmanagement.repository.ProjectDocumentRepository;
import com.skyward.projectmanagement.repository.SubcontractorPaymentRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ContractorPortalService {

    private final ContractorRepository contractorRepository;

    private final ContractorBillRepository contractorBillRepository;

    private final SubcontractorPaymentRepository paymentRepository;

    private final ProjectDocumentRepository projectDocumentRepository;

    private final ContractorProjectAssignmentService assignmentService;

    public ContractorPortalService(
            ContractorRepository contractorRepository,
            ContractorBillRepository contractorBillRepository,
            SubcontractorPaymentRepository paymentRepository,
            ProjectDocumentRepository projectDocumentRepository,
            ContractorProjectAssignmentService assignmentService
    ) {

        this.contractorRepository =
                contractorRepository;

        this.contractorBillRepository =
                contractorBillRepository;

        this.paymentRepository =
                paymentRepository;

        this.projectDocumentRepository =
                projectDocumentRepository;

        this.assignmentService =
                assignmentService;
    }

    /*
     * =========================================================
     * PROFILE
     * =========================================================
     */

    public Map<String, Object> getMyProfile(
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

    /*
     * =========================================================
     * PROJECTS
     * =========================================================
     */

    public List<Map<String, Object>> getMyProjects(
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

    /*
     * =========================================================
     * BILLS
     * =========================================================
     */

    public List<Map<String, Object>> getMyBills(
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

    /*
     * =========================================================
     * PAYMENTS
     * =========================================================
     */

    public List<Map<String, Object>> getMyPayments(
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

    /*
     * Secure payment access for contractor slip download.
     */
    public SubcontractorPayment getMyPaymentForSlip(
            String username,
            Long paymentId
    ) {

        Contractor contractor =
                getContractor(
                        username
                );

        SubcontractorPayment payment =
                paymentRepository
                        .findById(
                                paymentId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found."
                                )
                        );

        if (
                payment.getContractor() == null
                        ||
                payment.getContractor()
                        .getId() == null
                        ||
                !payment.getContractor()
                        .getId()
                        .equals(
                                contractor.getId()
                        )
        ) {
            throw new RuntimeException(
                    "You do not have access to this payment."
            );
        }

        if (
                payment.getSlipFilePath() == null
                        ||
                payment.getSlipFilePath().isBlank()
        ) {
            throw new RuntimeException(
                    "No payment slip is available for this payment."
            );
        }

        return payment;
    }

    /*
     * =========================================================
     * PROJECT DOCUMENTS
     * =========================================================
     */

    public List<Map<String, Object>> getMyDocuments(
            String username
    ) {

        Contractor contractor =
                getContractor(
                        username
                );

        List<Project> assignedProjects =
                assignmentService
                        .getAssignedProjects(
                                contractor.getId()
                        );

        List<ProjectDocument> documents =
                new ArrayList<>();

        for (
                Project project :
                assignedProjects
        ) {

            if (
                    project == null
                            ||
                    project.getId() == null
            ) {
                continue;
            }

            documents.addAll(
                    projectDocumentRepository
                            .findByProjectIdAndContractorVisibleTrue(
                                    project.getId()
                            )
            );
        }

        return documents
                .stream()
                .sorted(
                        Comparator
                                .comparing(
                                        ProjectDocument::getDocumentDate,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                                .thenComparing(
                                        ProjectDocument::getId,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                )
                .map(
                        this::toDocumentResponse
                )
                .collect(
                        Collectors.toList()
                );
    }

    public List<Map<String, Object>> getMyProjectDocuments(
            String username,
            Long projectId
    ) {

        Contractor contractor =
                getContractor(
                        username
                );

        if (
                !assignmentService
                        .hasProjectAccess(
                                contractor.getId(),
                                projectId
                        )
        ) {
            throw new RuntimeException(
                    "You do not have access to this project."
            );
        }

        return projectDocumentRepository
                .findByProjectIdAndContractorVisibleTrue(
                        projectId
                )
                .stream()
                .sorted(
                        Comparator
                                .comparing(
                                        ProjectDocument::getDocumentDate,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                                .thenComparing(
                                        ProjectDocument::getId,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                )
                .map(
                        this::toDocumentResponse
                )
                .collect(
                        Collectors.toList()
                );
    }

    /*
     * Used by secure document download endpoint.
     */
    public ProjectDocument getMyDocumentForDownload(
            String username,
            Long documentId
    ) {

        Contractor contractor =
                getContractor(
                        username
                );

        ProjectDocument document =
                projectDocumentRepository
                        .findById(
                                documentId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project document not found."
                                )
                        );

        if (
                !Boolean.TRUE.equals(
                        document.getContractorVisible()
                )
        ) {
            throw new RuntimeException(
                    "You do not have access to this document."
            );
        }

        if (
                document.getProject() == null
                        ||
                document.getProject()
                        .getId() == null
        ) {
            throw new RuntimeException(
                    "Document project information is missing."
            );
        }

        Long projectId =
                document
                        .getProject()
                        .getId();

        if (
                !assignmentService
                        .hasProjectAccess(
                                contractor.getId(),
                                projectId
                        )
        ) {
            throw new RuntimeException(
                    "You do not have access to this document."
            );
        }

        if (
                document.getFilePath() == null
                        ||
                document.getFilePath().isBlank()
        ) {
            throw new RuntimeException(
                    "Document file is not available."
            );
        }

        return document;
    }

    /*
     * =========================================================
     * DASHBOARD
     * =========================================================
     */

    public Map<String, Object> getDashboard(
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

        /*
         * Only money allocated to contractor bills.
         */
        BigDecimal totalPaid =
                bills.stream()
                        .map(
                                ContractorBill::getPaidAmount
                        )
                        .filter(
                                Objects::nonNull
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        /*
         * All payment transactions recorded
         * for this contractor.
         */
        BigDecimal totalPayments =
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

        /*
         * Payments that have not yet been
         * allocated to a contractor bill.
         */
        BigDecimal unallocatedPayments =
                payments.stream()
                        .filter(
                                payment ->
                                        payment.getContractorBill()
                                                == null
                        )
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
                "totalPayments",
                totalPayments
        );

        response.put(
                "unallocatedPayments",
                unallocatedPayments
        );

        response.put(
                "outstandingBalance",
                outstanding
        );

        return response;
    }

    /*
     * =========================================================
     * CONTRACTOR VALIDATION
     * =========================================================
     */

    private Contractor getContractor(
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

    /*
     * =========================================================
     * RESPONSE MAPPERS
     * =========================================================
     */

    private Map<String, Object> toProjectResponse(
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

    private Map<String, Object> toBillResponse(
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

    private Map<String, Object> toPaymentResponse(
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

    private Map<String, Object> toDocumentResponse(
            ProjectDocument document
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                document.getId()
        );

        response.put(
                "documentDate",
                document.getDocumentDate()
        );

        response.put(
                "title",
                document.getTitle()
        );

        response.put(
                "description",
                document.getDescription()
        );

        response.put(
                "documentType",
                document.getDocumentType()
        );

        response.put(
                "originalFileName",
                document.getOriginalFileName()
        );

        response.put(
                "contentType",
                document.getContentType()
        );

        response.put(
                "fileSize",
                document.getFileSize()
        );

        response.put(
                "uploadedBy",
                document.getUploadedBy()
        );

        if (
                document.getProject() != null
        ) {

            response.put(
                    "projectId",
                    document.getProject()
                            .getId()
            );

            response.put(
                    "projectName",
                    document.getProject()
                            .getProjectName()
            );
        }

        return response;
    }
}