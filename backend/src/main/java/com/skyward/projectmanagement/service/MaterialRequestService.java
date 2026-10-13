package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.Contractor;
import com.skyward.projectmanagement.entity.MaterialRequest;
import com.skyward.projectmanagement.entity.Notification;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.model.Project;

import com.skyward.projectmanagement.repository.ContractorRepository;
import com.skyward.projectmanagement.repository.MaterialRequestRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
public class MaterialRequestService {

    private final MaterialRequestRepository
            materialRequestRepository;

    private final ProjectRepository
            projectRepository;

    private final UserRepository
            userRepository;

    private final SupervisorPortalService
            supervisorPortalService;

    private final NotificationService
            notificationService;

    private final AuditLogService
            auditLogService;

    private final ContractorRepository
            contractorRepository;

    private final ContractorProjectAssignmentService
            contractorProjectAssignmentService;

    public MaterialRequestService(
            MaterialRequestRepository materialRequestRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            SupervisorPortalService supervisorPortalService,
            NotificationService notificationService,
            AuditLogService auditLogService,
            ContractorRepository contractorRepository,
            ContractorProjectAssignmentService contractorProjectAssignmentService
    ) {
        this.materialRequestRepository =
                materialRequestRepository;

        this.projectRepository =
                projectRepository;

        this.userRepository =
                userRepository;

        this.supervisorPortalService =
                supervisorPortalService;

        this.notificationService =
                notificationService;

        this.auditLogService =
                auditLogService;

        this.contractorRepository =
                contractorRepository;

        this.contractorProjectAssignmentService =
                contractorProjectAssignmentService;
    }

    /*
     * =========================================================
     * SUPERVISOR
     * =========================================================
     */

    public MaterialRequest
    createSupervisorRequest(
            String username,
            Long projectId,
            MaterialRequest request
    ) {

        if (
                !supervisorPortalService
                        .hasProjectAccess(
                                username,
                                projectId
                        )
        ) {
            throw new RuntimeException(
                    "You do not have access to this project."
            );
        }

        validateRequest(
                request
        );

        Project project =
                getProject(
                        projectId
                );

        prepareNewRequest(
                request,
                project,
                username
        );

        MaterialRequest savedRequest =
                materialRequestRepository
                        .save(
                                request
                        );

        createMaterialNotification(
                username,
                savedRequest,
                project
        );

        return savedRequest;
    }

    public List<MaterialRequest>
    getSupervisorProjectRequests(
            String username,
            Long projectId
    ) {

        if (
                !supervisorPortalService
                        .hasProjectAccess(
                                username,
                                projectId
                        )
        ) {
            throw new RuntimeException(
                    "You do not have access to this project."
            );
        }

        return materialRequestRepository
                .findByProjectId(
                        projectId
                );
    }

    /*
     * =========================================================
     * CONTRACTOR
     * =========================================================
     */

    public MaterialRequest
    createContractorRequest(
            String username,
            Long projectId,
            MaterialRequest request
    ) {

        Contractor contractor =
                requireContractor(
                        username
                );

        if (
                !contractorProjectAssignmentService
                        .hasProjectAccess(
                                contractor.getId(),
                                projectId
                        )
        ) {
            throw new RuntimeException(
                    "You do not have access to this project."
            );
        }

        validateRequest(
                request
        );

        Project project =
                getProject(
                        projectId
                );

        prepareNewRequest(
                request,
                project,
                username
        );

        MaterialRequest savedRequest =
                materialRequestRepository
                        .save(
                                request
                        );

        createMaterialNotification(
                username,
                savedRequest,
                project
        );

        return savedRequest;
    }

    public List<MaterialRequest>
    getContractorRequests(
            String username
    ) {

        Contractor contractor =
                requireContractor(
                        username
                );

        return materialRequestRepository
                .findAll()
                .stream()
                .filter(
                        request ->
                                username.equals(
                                        request.getRequestedBy()
                                )
                )
                .filter(
                        request ->
                                request.getProject() != null
                                        &&
                                contractorProjectAssignmentService
                                        .hasProjectAccess(
                                                contractor.getId(),
                                                request.getProject()
                                                        .getId()
                                        )
                )
                .sorted(
                        Comparator.comparing(
                                MaterialRequest::getRequestDate,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder()
                                )
                        )
                )
                .toList();
    }

    public List<MaterialRequest>
    getContractorProjectRequests(
            String username,
            Long projectId
    ) {

        Contractor contractor =
                requireContractor(
                        username
                );

        if (
                !contractorProjectAssignmentService
                        .hasProjectAccess(
                                contractor.getId(),
                                projectId
                        )
        ) {
            throw new RuntimeException(
                    "You do not have access to this project."
            );
        }

        return materialRequestRepository
                .findByProjectId(
                        projectId
                )
                .stream()
                .filter(
                        request ->
                                username.equals(
                                        request.getRequestedBy()
                                )
                )
                .sorted(
                        Comparator.comparing(
                                MaterialRequest::getRequestDate,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder()
                                )
                        )
                )
                .toList();
    }

    /*
     * =========================================================
     * ADMIN / MANAGER
     * =========================================================
     */

    public List<MaterialRequest>
    getAllForManagement(
            String username
    ) {

        requireManagementUser(
                username
        );

        return materialRequestRepository
                .findAll();
    }

    public List<MaterialRequest>
    getProjectRequestsForManagement(
            String username,
            Long projectId
    ) {

        requireManagementUser(
                username
        );

        if (
                !projectRepository
                        .existsById(
                                projectId
                        )
        ) {
            throw new RuntimeException(
                    "Project not found."
            );
        }

        return materialRequestRepository
                .findByProjectId(
                        projectId
                );
    }

    public MaterialRequest
    getByIdForManagement(
            String username,
            Long requestId
    ) {

        requireManagementUser(
                username
        );

        return getRequestById(
                requestId
        );
    }

    public MaterialRequest
    reviewRequest(
            String username,
            Long requestId,
            String status,
            String remarks
    ) {

        requireManagementUser(
                username
        );

        MaterialRequest request =
                getRequestById(
                        requestId
                );

        MaterialRequest.RequestStatus
                newStatus;

        try {

            newStatus =
                    MaterialRequest
                            .RequestStatus
                            .valueOf(
                                    status
                                            .trim()
                                            .toUpperCase()
                            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Status must be APPROVED or REJECTED."
            );
        }

        if (
                newStatus !=
                        MaterialRequest
                                .RequestStatus
                                .APPROVED
                        &&
                newStatus !=
                        MaterialRequest
                                .RequestStatus
                                .REJECTED
        ) {
            throw new RuntimeException(
                    "Status must be APPROVED or REJECTED."
            );
        }

        request.setStatus(
                newStatus
        );

        request.setReviewedBy(
                username
        );

        request.setReviewedDate(
                LocalDate.now()
        );

        request.setReviewRemarks(
                remarks == null
                        ||
                remarks.isBlank()
                        ? null
                        : remarks.trim()
        );

        MaterialRequest savedRequest =
                materialRequestRepository
                        .save(
                                request
                        );

        auditLogService
                .logAction(
                        username,
                        "MATERIAL_REQUEST",
                        newStatus.name(),
                        "Material request '"
                                + savedRequest
                                        .getMaterialName()
                                + "' was "
                                + newStatus
                                        .name()
                                        .toLowerCase()
                                + ".",
                        savedRequest.getId(),
                        "MATERIAL_REQUEST",
                        savedRequest.getProject()
                );

        return savedRequest;
    }

    /*
     * =========================================================
     * HELPERS
     * =========================================================
     */

    private Contractor
    requireContractor(
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
                !"CONTRACTOR"
                        .equalsIgnoreCase(
                                contractor.getUser()
                                        .getRole()
                        )
        ) {
            throw new RuntimeException(
                    "Invalid contractor login account."
            );
        }

        if (
                !Boolean.TRUE.equals(
                        contractor.getUser()
                                .getActive()
                )
        ) {
            throw new RuntimeException(
                    "User account is inactive."
            );
        }

        return contractor;
    }

    private Project
    getProject(
            Long projectId
    ) {

        return projectRepository
                .findById(
                        projectId
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Project not found."
                                )
                );
    }

    private MaterialRequest
    getRequestById(
            Long requestId
    ) {

        return materialRequestRepository
                .findById(
                        requestId
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Material request not found."
                                )
                );
    }

    private void
    prepareNewRequest(
            MaterialRequest request,
            Project project,
            String username
    ) {

        request.setProject(
                project
        );

        request.setRequestedBy(
                username
        );

        if (
                request.getRequestDate()
                        == null
        ) {
            request.setRequestDate(
                    LocalDate.now()
            );
        }

        request.setStatus(
                MaterialRequest
                        .RequestStatus
                        .PENDING
        );

        request.setReviewedBy(
                null
        );

        request.setReviewedDate(
                null
        );

        request.setReviewRemarks(
                null
        );
    }

    private void
    createMaterialNotification(
            String username,
            MaterialRequest request,
            Project project
    ) {

        notificationService
                .createNotification(
                        "New Material Request",

                        username
                                + " requested "
                                + request.getMaterialName()
                                + " for "
                                + project.getProjectName(),

                        Notification
                                .NotificationType
                                .MATERIAL_REQUEST,

                        username,

                        request.getId(),

                        "MATERIAL_REQUEST",

                        project
                );
    }

    private User
    requireManagementUser(
            String username
    ) {

        User user =
                userRepository
                        .findByUsername(
                                username
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Logged-in user not found."
                                        )
                        );

        if (
                !Boolean.TRUE.equals(
                        user.getActive()
                )
        ) {
            throw new RuntimeException(
                    "User account is inactive."
            );
        }

        String role =
                user.getRole();

        if (
                !"ADMIN"
                        .equalsIgnoreCase(
                                role
                        )
                        &&
                !"MANAGER"
                        .equalsIgnoreCase(
                                role
                        )
        ) {
            throw new RuntimeException(
                    "Only ADMIN or MANAGER users can review material requests."
            );
        }

        return user;
    }

    private void
    validateRequest(
            MaterialRequest request
    ) {

        if (
                request == null
        ) {
            throw new RuntimeException(
                    "Material request data is required."
            );
        }

        if (
                request.getMaterialName() == null
                        ||
                request.getMaterialName()
                        .isBlank()
        ) {
            throw new RuntimeException(
                    "Material name is required."
            );
        }

        if (
                request.getQuantity() == null
                        ||
                request.getQuantity()
                        .compareTo(
                                BigDecimal.ZERO
                        ) <= 0
        ) {
            throw new RuntimeException(
                    "Quantity must be greater than zero."
            );
        }

        if (
                request.getUnit() == null
                        ||
                request.getUnit()
                        .isBlank()
        ) {
            throw new RuntimeException(
                    "Unit is required."
            );
        }

        request.setMaterialName(
                request
                        .getMaterialName()
                        .trim()
        );

        request.setUnit(
                request
                        .getUnit()
                        .trim()
        );

        if (
                request.getPurpose() != null
        ) {
            request.setPurpose(
                    request
                            .getPurpose()
                            .trim()
            );
        }

        if (
                request.getNotes() != null
        ) {
            request.setNotes(
                    request
                            .getNotes()
                            .trim()
            );
        }
    }
}