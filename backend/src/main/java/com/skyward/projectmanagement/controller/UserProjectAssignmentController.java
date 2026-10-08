package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.dto.UserProjectAssignmentResponse;
import com.skyward.projectmanagement.service.UserProjectAssignmentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(
        "/api/user-project-assignments"
)
public class UserProjectAssignmentController {

    private final UserProjectAssignmentService service;

    public UserProjectAssignmentController(
            UserProjectAssignmentService service
    ) {
        this.service = service;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<
            List<UserProjectAssignmentResponse>
            >
    getByUser(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                service.getAssignmentsByUser(
                        userId
                )
        );
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<
            List<UserProjectAssignmentResponse>
            >
    getByProject(
            @PathVariable Long projectId
    ) {

        return ResponseEntity.ok(
                service.getAssignmentsByProject(
                        projectId
                )
        );
    }

    @PostMapping
    public ResponseEntity<
            UserProjectAssignmentResponse
            >
    assignProject(
            @RequestParam Long userId,
            @RequestParam Long projectId
    ) {

        return ResponseEntity.ok(
                service.assignProject(
                        userId,
                        projectId
                )
        );
    }

    @DeleteMapping
    public ResponseEntity<Void>
    unassignProject(
            @RequestParam Long userId,
            @RequestParam Long projectId
    ) {

        service.unassignProject(
                userId,
                projectId
        );

        return ResponseEntity
                .noContent()
                .build();
    }
}