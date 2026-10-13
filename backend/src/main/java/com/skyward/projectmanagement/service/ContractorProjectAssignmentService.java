package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.Contractor;
import com.skyward.projectmanagement.entity.ContractorProjectAssignment;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.model.Project;

import com.skyward.projectmanagement.repository.ContractorProjectAssignmentRepository;
import com.skyward.projectmanagement.repository.ContractorRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ContractorProjectAssignmentService {

    private final ContractorProjectAssignmentRepository
            assignmentRepository;

    private final ContractorRepository
            contractorRepository;

    private final ProjectRepository
            projectRepository;

    private final UserRepository
            userRepository;

    public ContractorProjectAssignmentService(
            ContractorProjectAssignmentRepository assignmentRepository,
            ContractorRepository contractorRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository
    ) {
        this.assignmentRepository =
                assignmentRepository;

        this.contractorRepository =
                contractorRepository;

        this.projectRepository =
                projectRepository;

        this.userRepository =
                userRepository;
    }

    @Transactional
    public Map<String, Object>
    assignProject(
            String username,
            Long contractorId,
            Long projectId
    ) {

        requireManagementUser(
                username
        );

        Contractor contractor =
                contractorRepository
                        .findById(
                                contractorId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Contractor not found."
                                        )
                        );

        Project project =
                projectRepository
                        .findById(
                                projectId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Project not found."
                                        )
                        );

        ContractorProjectAssignment assignment =
                assignmentRepository
                        .findByContractorIdAndProjectId(
                                contractorId,
                                projectId
                        )
                        .orElse(
                                new ContractorProjectAssignment()
                        );

        assignment.setContractor(
                contractor
        );

        assignment.setProject(
                project
        );

        assignment.setActive(
                true
        );

        ContractorProjectAssignment saved =
                assignmentRepository
                        .save(
                                assignment
                        );

        return toResponse(
                saved
        );
    }

    public List<Map<String, Object>>
    getContractorProjects(
            String username,
            Long contractorId
    ) {

        requireManagementUser(
                username
        );

        if (
                !contractorRepository
                        .existsById(
                                contractorId
                        )
        ) {
            throw new RuntimeException(
                    "Contractor not found."
            );
        }

        return assignmentRepository
                .findByContractorIdAndActiveTrue(
                        contractorId
                )
                .stream()
                .map(
                        this::toResponse
                )
                .collect(
                        Collectors.toList()
                );
    }

    @Transactional
    public Map<String, Object>
    removeProject(
            String username,
            Long contractorId,
            Long projectId
    ) {

        requireManagementUser(
                username
        );

        ContractorProjectAssignment assignment =
                assignmentRepository
                        .findByContractorIdAndProjectId(
                                contractorId,
                                projectId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Contractor project assignment not found."
                                        )
                        );

        assignment.setActive(
                false
        );

        assignmentRepository
                .save(
                        assignment
                );

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "success",
                true
        );

        response.put(
                "message",
                "Project assignment removed."
        );

        response.put(
                "contractorId",
                contractorId
        );

        response.put(
                "projectId",
                projectId
        );

        return response;
    }

    public boolean
    hasProjectAccess(
            Long contractorId,
            Long projectId
    ) {

        return assignmentRepository
                .existsByContractorIdAndProjectIdAndActiveTrue(
                        contractorId,
                        projectId
                );
    }

    public List<Project>
    getAssignedProjects(
            Long contractorId
    ) {

        return assignmentRepository
                .findByContractorIdAndActiveTrue(
                        contractorId
                )
                .stream()
                .map(
                        ContractorProjectAssignment::getProject
                )
                .collect(
                        Collectors.toList()
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
                    "Only ADMIN or MANAGER users can manage contractor project assignments."
            );
        }

        return user;
    }

    private Map<String, Object>
    toResponse(
            ContractorProjectAssignment assignment
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                assignment.getId()
        );

        response.put(
                "contractorId",
                assignment
                        .getContractor()
                        .getId()
        );

        response.put(
                "contractorName",
                assignment
                        .getContractor()
                        .getName()
        );

        response.put(
                "projectId",
                assignment
                        .getProject()
                        .getId()
        );

        response.put(
                "projectName",
                assignment
                        .getProject()
                        .getProjectName()
        );

        response.put(
                "location",
                assignment
                        .getProject()
                        .getLocation()
        );

        response.put(
                "status",
                assignment
                        .getProject()
                        .getStatus()
        );

        response.put(
                "assignedDate",
                assignment
                        .getAssignedDate()
        );

        response.put(
                "active",
                assignment
                        .getActive()
        );

        return response;
    }
}