package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.MaterialRequest;
import com.skyward.projectmanagement.entity.Notification;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.model.Project;

import com.skyward.projectmanagement.repository.MaterialRequestRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class MaterialRequestService {

    private final MaterialRequestRepository materialRequestRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SupervisorPortalService supervisorPortalService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public MaterialRequestService(
            MaterialRequestRepository materialRequestRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            SupervisorPortalService supervisorPortalService,
            NotificationService notificationService,
            AuditLogService auditLogService
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
    }

    /*
     * =========================================================
     * SUPERVISOR
     * =========================================================
     */

    public MaterialRequest createSupervisorRequest(
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

        validateRequest(request);

        Project project =
                projectRepository
                        .findById(projectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found."
                                )
                        );

        request.setProject(project);

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

        request.setReviewedBy(null);
        request.setReviewedDate(null);
        request.setReviewRemarks(null);

        MaterialRequest savedRequest =
                materialRequestRepository
                        .save(request);

        notificationService
                .createNotification(
                        "New Material Request",
                        username
                                + " requested "
                                + savedRequest.getMaterialName()
                                + " for "
                                + project.getProjectName(),
                        Notification.NotificationType.MATERIAL_REQUEST,
                        username,
                        savedRequest.getId(),
                        "MATERIAL_REQUEST",
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

    public MaterialRequest reviewRequest(
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
                remarks == null ||
                remarks.isBlank()
                        ? null
                        : remarks.trim()
        );

        MaterialRequest savedRequest =
                materialRequestRepository
                        .save(
                                request
                        );

        auditLogService.logAction(
                username,
                "MATERIAL_REQUEST",
                newStatus.name(),
                "Material request '"
                        + savedRequest.getMaterialName()
                        + "' was "
                        + newStatus.name().toLowerCase()
                        + ".",
                savedRequest.getId(),
                "MATERIAL_REQUEST",
                savedRequest.getProject()
        );

        return savedRequest;
    }

    /*
     * =========================================================
     * PRIVATE HELPERS
     * =========================================================
     */

    private MaterialRequest
    getRequestById(
            Long requestId
    ) {

        return materialRequestRepository
                .findById(
                        requestId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Material request not found."
                        )
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
                        .orElseThrow(() ->
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
                !"ADMIN".equalsIgnoreCase(
                        role
                )
                        &&
                !"MANAGER".equalsIgnoreCase(
                        role
                )
        ) {
            throw new RuntimeException(
                    "Only ADMIN or MANAGER users can review material requests."
            );
        }

        return user;
    }

    private void validateRequest(
            MaterialRequest request
    ) {

        if (
                request.getMaterialName()
                        == null
                        ||
                request.getMaterialName()
                        .isBlank()
        ) {
            throw new RuntimeException(
                    "Material name is required."
            );
        }

        if (
                request.getQuantity()
                        == null
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
                request.getUnit()
                        == null
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
    }
}