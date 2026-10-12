package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.dto.ClientDashboardDto;
import com.skyward.projectmanagement.dto.ClientProjectSummaryDto;
import com.skyward.projectmanagement.entity.ProjectDocument;
import com.skyward.projectmanagement.entity.SitePhoto;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.entity.UserProjectAssignment;
import com.skyward.projectmanagement.model.DailyProgress;
import com.skyward.projectmanagement.model.Payment;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.DailyProgressRepository;
import com.skyward.projectmanagement.repository.PaymentRepository;
import com.skyward.projectmanagement.repository.ProjectDocumentRepository;
import com.skyward.projectmanagement.repository.SitePhotoRepository;
import com.skyward.projectmanagement.repository.UserProjectAssignmentRepository;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class ClientPortalService {

    private final UserRepository userRepository;
    private final UserProjectAssignmentRepository assignmentRepository;
    private final DailyProgressRepository dailyProgressRepository;
    private final PaymentRepository paymentRepository;
    private final SitePhotoRepository sitePhotoRepository;
    private final ProjectDocumentRepository projectDocumentRepository;

    public ClientPortalService(
            UserRepository userRepository,
            UserProjectAssignmentRepository assignmentRepository,
            DailyProgressRepository dailyProgressRepository,
            PaymentRepository paymentRepository,
            SitePhotoRepository sitePhotoRepository,
            ProjectDocumentRepository projectDocumentRepository
    ) {
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.dailyProgressRepository = dailyProgressRepository;
        this.paymentRepository = paymentRepository;
        this.sitePhotoRepository = sitePhotoRepository;
        this.projectDocumentRepository = projectDocumentRepository;
    }

    public List<ClientProjectSummaryDto> getMyProjects(
            String username
    ) {

        User user = getClientUser(username);

        return assignmentRepository
                .findByUserId(user.getId())
                .stream()
                .map(this::toProjectSummary)
                .toList();
    }

    public ClientProjectSummaryDto getMyProject(
            String username,
            Long projectId
    ) {

        UserProjectAssignment assignment =
                getClientProjectAssignment(
                        username,
                        projectId
                );

        return toProjectSummary(assignment);
    }

    public ClientDashboardDto getMyDashboard(
            String username,
            Long projectId
    ) {

        UserProjectAssignment assignment =
                getClientProjectAssignment(
                        username,
                        projectId
                );

        Project project =
                assignment.getProject();

        Optional<DailyProgress>
                latestProgressOptional =
                dailyProgressRepository
                        .findTopByProjectIdOrderByDateDescIdDesc(
                                projectId
                        );

        DailyProgress latestProgress =
                latestProgressOptional
                        .orElse(null);

        Integer physicalProgress =
                latestProgress != null
                        &&
                latestProgress.getProgressPercentage() != null
                        ? latestProgress.getProgressPercentage()
                        : 0;

        List<Payment> payments =
                paymentRepository
                        .findByProjectId(
                                projectId
                        );

        BigDecimal totalPaid =
                payments.stream()
                        .map(Payment::getAmount)
                        .filter(
                                amount ->
                                        amount != null
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal projectValue =
                project.getBudget() != null
                        ? project.getBudget()
                        : BigDecimal.ZERO;

        BigDecimal paymentBalance =
                projectValue.subtract(
                        totalPaid
                );

        if (
                paymentBalance.compareTo(
                        BigDecimal.ZERO
                ) < 0
        ) {
            paymentBalance =
                    BigDecimal.ZERO;
        }

        LocalDate today =
                LocalDate.now();

        Long totalProjectDays = 0L;
        Long daysCompleted = 0L;
        Long daysRemaining = 0L;

        if (
                project.getStartDate() != null
                        &&
                project.getEndDate() != null
        ) {

            totalProjectDays =
                    ChronoUnit.DAYS.between(
                            project.getStartDate(),
                            project.getEndDate()
                    );

            if (
                    today.isBefore(
                            project.getStartDate()
                    )
            ) {

                daysCompleted = 0L;
                daysRemaining =
                        totalProjectDays;

            } else if (
                    today.isAfter(
                            project.getEndDate()
                    )
            ) {

                daysCompleted =
                        totalProjectDays;

                daysRemaining = 0L;

            } else {

                daysCompleted =
                        ChronoUnit.DAYS.between(
                                project.getStartDate(),
                                today
                        );

                daysRemaining =
                        ChronoUnit.DAYS.between(
                                today,
                                project.getEndDate()
                        );
            }
        }

        return new ClientDashboardDto(
                project.getId(),
                project.getProjectName(),
                project.getLocation(),
                project.getDescription(),
                project.getStatus(),

                project.getStartDate(),
                project.getEndDate(),

                projectValue,

                physicalProgress,

                totalProjectDays,
                daysCompleted,
                daysRemaining,

                totalPaid,
                paymentBalance,

                latestProgress != null
                        ? latestProgress.getDate()
                        : null,

                latestProgress != null
                        ? latestProgress
                        .getWorkDescription()
                        : null,

                latestProgress != null
                        ? latestProgress
                        .getWorkersCount()
                        : null,

                latestProgress != null
                        ? latestProgress
                        .getRemarks()
                        : null
        );
    }

    /*
     * =========================================================
     * CLIENT SITE PHOTOS
     * =========================================================
     */

    public List<SitePhoto>
    getMyVisibleSitePhotos(
            String username,
            Long projectId
    ) {

        getClientProjectAssignment(
                username,
                projectId
        );

        return sitePhotoRepository
                .findByProjectIdAndClientVisibleTrue(
                        projectId
                )
                .stream()
                .sorted(
                        Comparator
                                .comparing(
                                        SitePhoto::getPhotoDate,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                                .thenComparing(
                                        SitePhoto::getId,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                )
                .toList();
    }

    public Resource
    getMyVisibleSitePhotoFile(
            String username,
            Long projectId,
            Long photoId
    ) {

        getClientProjectAssignment(
                username,
                projectId
        );

        SitePhoto photo =
                sitePhotoRepository
                        .findById(photoId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Site photo not found."
                                )
                        );

        if (
                photo.getProject() == null
                        ||
                photo.getProject().getId() == null
                        ||
                !photo.getProject().getId()
                        .equals(projectId)
        ) {
            throw new RuntimeException(
                    "This photo does not belong to this project."
            );
        }

        if (
                !Boolean.TRUE.equals(
                        photo.getClientVisible()
                )
        ) {
            throw new RuntimeException(
                    "This photo is not available to the client."
            );
        }

        try {

            Path path =
                    Paths.get(
                            photo.getFilePath()
                    )
                    .toAbsolutePath()
                    .normalize();

            Resource resource =
                    new UrlResource(
                            path.toUri()
                    );

            if (
                    !resource.exists()
                            ||
                    !resource.isReadable()
            ) {
                throw new RuntimeException(
                        "Photo file not found."
                );
            }

            return resource;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to load photo file.",
                    e
            );
        }
    }

    /*
     * =========================================================
     * CLIENT DOCUMENTS
     * =========================================================
     */

    public List<ProjectDocument>
    getMyVisibleDocuments(
            String username,
            Long projectId
    ) {

        getClientProjectAssignment(
                username,
                projectId
        );

        return projectDocumentRepository
                .findByProjectIdAndClientVisibleTrue(
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
                .toList();
    }

    public ProjectDocument
    getMyVisibleDocument(
            String username,
            Long projectId,
            Long documentId
    ) {

        getClientProjectAssignment(
                username,
                projectId
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
                document.getProject() == null
                        ||
                document.getProject().getId() == null
                        ||
                !document.getProject()
                        .getId()
                        .equals(projectId)
        ) {
            throw new RuntimeException(
                    "This document does not belong to this project."
            );
        }

        if (
                !Boolean.TRUE.equals(
                        document.getClientVisible()
                )
        ) {
            throw new RuntimeException(
                    "This document is not available to the client."
            );
        }

        return document;
    }

    public Resource
    getMyVisibleDocumentFile(
            String username,
            Long projectId,
            Long documentId
    ) {

        ProjectDocument document =
                getMyVisibleDocument(
                        username,
                        projectId,
                        documentId
                );

        try {

            Path path =
                    Paths.get(
                            document.getFilePath()
                    )
                    .toAbsolutePath()
                    .normalize();

            Resource resource =
                    new UrlResource(
                            path.toUri()
                    );

            if (
                    !resource.exists()
                            ||
                    !resource.isReadable()
            ) {
                throw new RuntimeException(
                        "Document file not found."
                );
            }

            return resource;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to load document file.",
                    e
            );
        }
    }

    /*
     * =========================================================
     * SECURITY
     * =========================================================
     */

    private User getClientUser(
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

        if (
                !"CLIENT"
                        .equalsIgnoreCase(
                                user.getRole()
                        )
        ) {
            throw new RuntimeException(
                    "Client portal access is only available for CLIENT users."
            );
        }

        return user;
    }

    private UserProjectAssignment
    getClientProjectAssignment(
            String username,
            Long projectId
    ) {

        User user =
                getClientUser(
                        username
                );

        return assignmentRepository
                .findByUserIdAndProjectId(
                        user.getId(),
                        projectId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "You do not have access to this project."
                        )
                );
    }

    private ClientProjectSummaryDto
    toProjectSummary(
            UserProjectAssignment assignment
    ) {

        Project project =
                assignment.getProject();

        return new ClientProjectSummaryDto(
                project.getId(),
                project.getProjectName(),
                project.getLocation(),
                project.getDescription(),
                project.getStartDate(),
                project.getEndDate(),
                project.getStatus(),
                project.getBudget()
        );
    }
}