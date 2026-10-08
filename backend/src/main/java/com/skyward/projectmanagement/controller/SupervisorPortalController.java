package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.dto.SupervisorProjectSummaryDto;
import com.skyward.projectmanagement.service.SupervisorPortalService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supervisor")
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

        String username =
                authentication.getName();

        return ResponseEntity.ok(
                supervisorPortalService
                        .getMyProjects(username)
        );
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<
            SupervisorProjectSummaryDto
            >
    getMyProject(
            @PathVariable Long projectId,
            Authentication authentication
    ) {

        String username =
                authentication.getName();

        return ResponseEntity.ok(
                supervisorPortalService
                        .getMyProject(
                                username,
                                projectId
                        )
        );
    }
}