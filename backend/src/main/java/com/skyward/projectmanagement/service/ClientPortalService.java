package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.dto.ClientProjectSummaryDto;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.entity.UserProjectAssignment;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.UserProjectAssignmentRepository;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientPortalService {

    private final UserRepository userRepository;
    private final UserProjectAssignmentRepository assignmentRepository;

    public ClientPortalService(
            UserRepository userRepository,
            UserProjectAssignmentRepository assignmentRepository
    ) {
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
    }

    public List<ClientProjectSummaryDto> getMyProjects(
            String username
    ) {

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found."
                        )
                );

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException(
                    "User account is inactive."
            );
        }

        if (!"CLIENT".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException(
                    "Client portal access is only available for CLIENT users."
            );
        }

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

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found."
                        )
                );

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException(
                    "User account is inactive."
            );
        }

        if (!"CLIENT".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException(
                    "Client portal access is only available for CLIENT users."
            );
        }

        UserProjectAssignment assignment =
                assignmentRepository
                        .findByUserIdAndProjectId(
                                user.getId(),
                                projectId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "You do not have access to this project."
                                )
                        );

        return toProjectSummary(
                assignment
        );
    }

    private ClientProjectSummaryDto toProjectSummary(
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