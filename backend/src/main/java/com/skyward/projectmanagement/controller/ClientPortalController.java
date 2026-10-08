package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.dto.ClientDashboardDto;
import com.skyward.projectmanagement.dto.ClientProjectSummaryDto;
import com.skyward.projectmanagement.service.ClientPortalService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
public class ClientPortalController {

    private final ClientPortalService clientPortalService;

    public ClientPortalController(
            ClientPortalService clientPortalService
    ) {
        this.clientPortalService =
                clientPortalService;
    }

    @GetMapping("/projects")
    public ResponseEntity<
            List<ClientProjectSummaryDto>
            >
    getMyProjects(
            Authentication authentication
    ) {

        String username =
                authentication.getName();

        return ResponseEntity.ok(
                clientPortalService
                        .getMyProjects(username)
        );
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<
            ClientProjectSummaryDto
            >
    getMyProject(
            @PathVariable Long projectId,
            Authentication authentication
    ) {

        String username =
                authentication.getName();

        return ResponseEntity.ok(
                clientPortalService
                        .getMyProject(
                                username,
                                projectId
                        )
        );
    }

    @GetMapping(
            "/projects/{projectId}/dashboard"
    )
    public ResponseEntity<
            ClientDashboardDto
            >
    getMyDashboard(
            @PathVariable Long projectId,
            Authentication authentication
    ) {

        String username =
                authentication.getName();

        return ResponseEntity.ok(
                clientPortalService
                        .getMyDashboard(
                                username,
                                projectId
                        )
        );
    }
}