package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.dto.SupervisorProjectSummaryDto;
import com.skyward.projectmanagement.model.DailyProgress;
import com.skyward.projectmanagement.service.SupervisorPortalService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supervisor")
@CrossOrigin(origins = "http://localhost:5173")
public class SupervisorPortalController {

    private final SupervisorPortalService supervisorPortalService;

    public SupervisorPortalController(
            SupervisorPortalService supervisorPortalService
    ) {
        this.supervisorPortalService =
                supervisorPortalService;
    }

    @GetMapping("/projects")
    public ResponseEntity<
            List<SupervisorProjectSummaryDto>
            >
    getMyProjects(
            Authentication authentication
    ) {

        try {

            return ResponseEntity.ok(
                    supervisorPortalService
                            .getMyProjects(
                                    authentication.getName()
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<?>
    getMyProject(
            @PathVariable Long projectId,
            Authentication authentication
    ) {

        try {

            return ResponseEntity.ok(
                    supervisorPortalService
                            .getMyProject(
                                    authentication.getName(),
                                    projectId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping(
            "/projects/{projectId}/progress"
    )
    public ResponseEntity<?>
    getProjectProgress(
            @PathVariable Long projectId,
            Authentication authentication
    ) {

        try {

            return ResponseEntity.ok(
                    supervisorPortalService
                            .getProjectProgress(
                                    authentication.getName(),
                                    projectId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PostMapping(
            "/projects/{projectId}/progress"
    )
    public ResponseEntity<?>
    createDailyProgress(
            @PathVariable Long projectId,
            @RequestBody DailyProgress progress,
            Authentication authentication
    ) {

        try {

            DailyProgress savedProgress =
                    supervisorPortalService
                            .createDailyProgress(
                                    authentication.getName(),
                                    projectId,
                                    progress
                            );

            return ResponseEntity.ok(
                    savedProgress
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}