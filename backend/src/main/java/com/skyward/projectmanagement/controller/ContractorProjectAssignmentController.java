package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.service.ContractorProjectAssignmentService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(
        "/api/contractor-project-assignments"
)
public class ContractorProjectAssignmentController {

    private final ContractorProjectAssignmentService
            assignmentService;

    public ContractorProjectAssignmentController(
            ContractorProjectAssignmentService assignmentService
    ) {
        this.assignmentService =
                assignmentService;
    }

    @PostMapping
    public ResponseEntity<?>
    assignProject(
            Authentication authentication,
            @RequestParam Long contractorId,
            @RequestParam Long projectId
    ) {

        try {

            return ResponseEntity.ok(
                    assignmentService
                            .assignProject(
                                    authentication
                                            .getName(),
                                    contractorId,
                                    projectId
                            )
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    @GetMapping(
            "/contractor/{contractorId}"
    )
    public ResponseEntity<?>
    getContractorProjects(
            Authentication authentication,
            @PathVariable Long contractorId
    ) {

        try {

            return ResponseEntity.ok(
                    assignmentService
                            .getContractorProjects(
                                    authentication
                                            .getName(),
                                    contractorId
                            )
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    @DeleteMapping
    public ResponseEntity<?>
    removeProject(
            Authentication authentication,
            @RequestParam Long contractorId,
            @RequestParam Long projectId
    ) {

        try {

            return ResponseEntity.ok(
                    assignmentService
                            .removeProject(
                                    authentication
                                            .getName(),
                                    contractorId,
                                    projectId
                            )
            );

        } catch (
                RuntimeException e
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }
}