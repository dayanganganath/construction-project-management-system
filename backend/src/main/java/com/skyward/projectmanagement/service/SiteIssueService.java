package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.Notification;
import com.skyward.projectmanagement.entity.SiteIssue;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.ProjectRepository;
import com.skyward.projectmanagement.repository.SiteIssueRepository;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
public class SiteIssueService {

    private final SiteIssueRepository siteIssueRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SupervisorPortalService supervisorPortalService;
    private final NotificationService notificationService;

    public SiteIssueService(
            SiteIssueRepository siteIssueRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            SupervisorPortalService supervisorPortalService,
            NotificationService notificationService
    ) {
        this.siteIssueRepository =
                siteIssueRepository;

        this.projectRepository =
                projectRepository;

        this.userRepository =
                userRepository;

        this.supervisorPortalService =
                supervisorPortalService;

        this.notificationService =
                notificationService;
    }

    /*
     * =========================================================
     * SUPERVISOR
     * =========================================================
     */

    public SiteIssue createSupervisorIssue(
            String username,
            Long projectId,
            SiteIssue issue
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

        validateIssue(issue);

        Project project =
                projectRepository
                        .findById(
                                projectId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found."
                                )
                        );

        SiteIssue newIssue =
                new SiteIssue();

        newIssue.setIssueDate(
                issue.getIssueDate() != null
                        ? issue.getIssueDate()
                        : LocalDate.now()
        );

        newIssue.setTitle(
                issue
                        .getTitle()
                        .trim()
        );

        newIssue.setDescription(
                issue
                        .getDescription()
                        .trim()
        );

        newIssue.setPriority(
                issue.getPriority() != null
                        ? issue.getPriority()
                        : SiteIssue.Priority.MEDIUM
        );

        newIssue.setStatus(
                SiteIssue.IssueStatus.OPEN
        );

        newIssue.setReportedBy(
                username
        );

        newIssue.setReviewedBy(
                null
        );

        newIssue.setReviewedDate(
                null
        );

        newIssue.setResolutionNote(
                null
        );

        newIssue.setProject(
                project
        );

        SiteIssue savedIssue =
                siteIssueRepository
                        .save(
                                newIssue
                        );

        notificationService
                .createNotification(
                        "New Site Issue",
                        username
                                + " reported: "
                                + savedIssue.getTitle()
                                + " - "
                                + project.getProjectName(),
                        Notification.NotificationType.SITE_ISSUE,
                        username,
                        savedIssue.getId(),
                        "SITE_ISSUE",
                        project
                );

        return savedIssue;
    }

    public List<SiteIssue>
    getSupervisorProjectIssues(
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

        return sortedProjectIssues(
                projectId
        );
    }

    /*
     * =========================================================
     * ADMIN / MANAGER
     * =========================================================
     */

    public List<SiteIssue>
    getAllForManagement(
            String username
    ) {

        requireManagementUser(
                username
        );

        return siteIssueRepository
                .findAll()
                .stream()
                .sorted(
                        Comparator
                                .comparing(
                                        SiteIssue::getIssueDate,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                                .thenComparing(
                                        SiteIssue::getId,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                )
                .toList();
    }

    public List<SiteIssue>
    getProjectIssuesForManagement(
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

        return sortedProjectIssues(
                projectId
        );
    }

    public SiteIssue
    getByIdForManagement(
            String username,
            Long issueId
    ) {

        requireManagementUser(
                username
        );

        return getIssueById(
                issueId
        );
    }

    public SiteIssue reviewIssue(
            String username,
            Long issueId,
            SiteIssue.IssueStatus status,
            String resolutionNote
    ) {

        requireManagementUser(
                username
        );

        if (
                status == null
        ) {
            throw new RuntimeException(
                    "Issue status is required."
            );
        }

        SiteIssue issue =
                getIssueById(
                        issueId
                );

        issue.setStatus(
                status
        );

        issue.setReviewedBy(
                username
        );

        issue.setReviewedDate(
                LocalDate.now()
        );

        issue.setResolutionNote(
                resolutionNote == null ||
                resolutionNote.isBlank()
                        ? null
                        : resolutionNote.trim()
        );

        return siteIssueRepository
                .save(
                        issue
                );
    }

    /*
     * =========================================================
     * HELPERS
     * =========================================================
     */

    private List<SiteIssue>
    sortedProjectIssues(
            Long projectId
    ) {

        return siteIssueRepository
                .findByProjectId(
                        projectId
                )
                .stream()
                .sorted(
                        Comparator
                                .comparing(
                                        SiteIssue::getIssueDate,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                                .thenComparing(
                                        SiteIssue::getId,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                )
                .toList();
    }

    private SiteIssue
    getIssueById(
            Long issueId
    ) {

        return siteIssueRepository
                .findById(
                        issueId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Site issue not found."
                        )
                );
    }

    private void validateIssue(
            SiteIssue issue
    ) {

        if (
                issue == null
        ) {
            throw new RuntimeException(
                    "Issue details are required."
            );
        }

        if (
                issue.getTitle() == null ||
                issue.getTitle().isBlank()
        ) {
            throw new RuntimeException(
                    "Issue title is required."
            );
        }

        if (
                issue.getDescription() == null ||
                issue.getDescription().isBlank()
        ) {
            throw new RuntimeException(
                    "Issue description is required."
            );
        }
    }

    private User requireManagementUser(
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
                !"ADMIN"
                        .equalsIgnoreCase(
                                user.getRole()
                        )
                        &&
                !"MANAGER"
                        .equalsIgnoreCase(
                                user.getRole()
                        )
        ) {
            throw new RuntimeException(
                    "Only ADMIN or MANAGER users can manage site issues."
            );
        }

        return user;
    }
}