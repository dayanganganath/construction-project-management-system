package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.dto.SupervisorProjectSummaryDto;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.entity.UserProjectAssignment;
import com.skyward.projectmanagement.model.DailyProgress;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.DailyProgressRepository;
import com.skyward.projectmanagement.repository.UserProjectAssignmentRepository;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SupervisorPortalService {

    private final UserRepository userRepository;
    private final UserProjectAssignmentRepository assignmentRepository;
    private final DailyProgressRepository dailyProgressRepository;
    private final DailyProgressService dailyProgressService;

    public SupervisorPortalService(
            UserRepository userRepository,
            UserProjectAssignmentRepository assignmentRepository,
            DailyProgressRepository dailyProgressRepository,
            DailyProgressService dailyProgressService
    ) {
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.dailyProgressRepository = dailyProgressRepository;
        this.dailyProgressService = dailyProgressService;
    }

    public List<SupervisorProjectSummaryDto> getMyProjects(
            String username
    ) {

        User user = getSupervisorUser(username);

        return assignmentRepository
                .findByUserId(user.getId())
                .stream()
                .map(this::toSummary)
                .toList();
    }

    public SupervisorProjectSummaryDto getMyProject(
            String username,
            Long projectId
    ) {

        UserProjectAssignment assignment =
                getSupervisorProjectAssignment(
                        username,
                        projectId
                );

        return toSummary(assignment);
    }

    public List<DailyProgress> getProjectProgress(
            String username,
            Long projectId
    ) {

        getSupervisorProjectAssignment(
                username,
                projectId
        );

        return dailyProgressRepository
                .findByProjectId(projectId);
    }

    public DailyProgress createDailyProgress(
            String username,
            Long projectId,
            DailyProgress progress
    ) {

        UserProjectAssignment assignment =
                getSupervisorProjectAssignment(
                        username,
                        projectId
                );

        Project assignedProject =
                assignment.getProject();

        /*
         * Important:
         * Ignore any project sent from frontend.
         * Always force the supervisor's assigned project.
         */
        progress.setProject(
                assignedProject
        );

        return dailyProgressService
                .createProgress(progress);
    }

    public boolean hasProjectAccess(
            String username,
            Long projectId
    ) {

        User user = getSupervisorUser(username);

        return assignmentRepository
                .existsByUserIdAndProjectId(
                        user.getId(),
                        projectId
                );
    }

    private User getSupervisorUser(
            String username
    ) {

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Logged-in user not found."
                                )
                        );

        if (!Boolean.TRUE.equals(
                user.getActive()
        )) {
            throw new RuntimeException(
                    "User account is inactive."
            );
        }

        if (!"SUPERVISOR".equalsIgnoreCase(
                user.getRole()
        )) {
            throw new RuntimeException(
                    "Supervisor portal access is only available for SUPERVISOR users."
            );
        }

        return user;
    }

    private UserProjectAssignment
    getSupervisorProjectAssignment(
            String username,
            Long projectId
    ) {

        User user =
                getSupervisorUser(username);

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

    private SupervisorProjectSummaryDto toSummary(
            UserProjectAssignment assignment
    ) {

        Project project =
                assignment.getProject();

        Optional<DailyProgress> latestOptional =
                dailyProgressRepository
                        .findTopByProjectIdOrderByDateDescIdDesc(
                                project.getId()
                        );

        DailyProgress latestProgress =
                latestOptional.orElse(null);

        return new SupervisorProjectSummaryDto(
                project.getId(),
                project.getProjectName(),
                project.getLocation(),
                project.getDescription(),
                project.getStatus(),
                project.getStartDate(),
                project.getEndDate(),

                latestProgress != null
                        ? latestProgress.getDate()
                        : null,

                latestProgress != null
                        ? latestProgress.getProgressPercentage()
                        : 0,

                latestProgress != null
                        ? latestProgress.getWorkersCount()
                        : 0,

                latestProgress != null
                        ? latestProgress.getWorkDescription()
                        : null,

                latestProgress != null
                        ? latestProgress.getRemarks()
                        : null
        );
    }
}