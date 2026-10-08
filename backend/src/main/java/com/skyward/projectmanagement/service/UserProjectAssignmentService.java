package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.dto.UserProjectAssignmentResponse;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.entity.UserProjectAssignment;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.ProjectRepository;
import com.skyward.projectmanagement.repository.UserProjectAssignmentRepository;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserProjectAssignmentService {

    private final UserProjectAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public UserProjectAssignmentService(
            UserProjectAssignmentRepository assignmentRepository,
            UserRepository userRepository,
            ProjectRepository projectRepository
    ) {
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    public List<UserProjectAssignmentResponse>
    getAssignmentsByUser(Long userId) {

        return assignmentRepository
                .findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<UserProjectAssignmentResponse>
    getAssignmentsByProject(Long projectId) {

        return assignmentRepository
                .findByProjectId(projectId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public UserProjectAssignmentResponse assignProject(
            Long userId,
            Long projectId
    ) {

        if (
                assignmentRepository
                        .existsByUserIdAndProjectId(
                                userId,
                                projectId
                        )
        ) {
            throw new RuntimeException(
                    "Project is already assigned to this user."
            );
        }

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found."
                                )
                        );

        Project project =
                projectRepository
                        .findById(projectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found."
                                )
                        );

        UserProjectAssignment assignment =
                new UserProjectAssignment();

        assignment.setUser(user);
        assignment.setProject(project);

        UserProjectAssignment saved =
                assignmentRepository.save(
                        assignment
                );

        return toResponse(saved);
    }

    @Transactional
    public void unassignProject(
            Long userId,
            Long projectId
    ) {

        UserProjectAssignment assignment =
                assignmentRepository
                        .findByUserIdAndProjectId(
                                userId,
                                projectId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project assignment not found."
                                )
                        );

        assignmentRepository.delete(
                assignment
        );
    }

    public boolean hasProjectAccess(
            Long userId,
            Long projectId
    ) {

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found."
                                )
                        );

        if (
                "ADMIN".equalsIgnoreCase(
                        user.getRole()
                ) ||
                "MANAGER".equalsIgnoreCase(
                        user.getRole()
                )
        ) {
            return true;
        }

        return assignmentRepository
                .existsByUserIdAndProjectId(
                        userId,
                        projectId
                );
    }

    private UserProjectAssignmentResponse toResponse(
            UserProjectAssignment assignment
    ) {

        User user =
                assignment.getUser();

        Project project =
                assignment.getProject();

        return new UserProjectAssignmentResponse(
                assignment.getId(),

                user != null
                        ? user.getId()
                        : null,

                user != null
                        ? user.getUsername()
                        : null,

                user != null
                        ? user.getRole()
                        : null,

                project != null
                        ? project.getId()
                        : null,

                project != null
                        ? project.getProjectName()
                        : null,

                project != null
                        ? project.getLocation()
                        : null,

                project != null
                        ? project.getStatus()
                        : null
        );
    }
}