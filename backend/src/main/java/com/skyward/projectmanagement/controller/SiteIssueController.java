package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.SiteIssue;
import com.skyward.projectmanagement.service.SiteIssueService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
public class SiteIssueController {

    private final SiteIssueService siteIssueService;

    public SiteIssueController(
            SiteIssueService siteIssueService
    ) {
        this.siteIssueService =
                siteIssueService;
    }

    /*
     * =========================================================
     * SUPERVISOR
     * =========================================================
     */

    @PostMapping(
            "/api/supervisor/projects/{projectId}/site-issues"
    )
    public ResponseEntity<?>
    createSupervisorIssue(
            Authentication authentication,
            @PathVariable Long projectId,
            @RequestBody SiteIssue issue
    ) {

        try {
            return ResponseEntity.ok(
                    siteIssueService
                            .createSupervisorIssue(
                                    authentication.getName(),
                                    projectId,
                                    issue
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    @GetMapping(
            "/api/supervisor/projects/{projectId}/site-issues"
    )
    public ResponseEntity<?>
    getSupervisorProjectIssues(
            Authentication authentication,
            @PathVariable Long projectId
    ) {

        try {
            return ResponseEntity.ok(
                    siteIssueService
                            .getSupervisorProjectIssues(
                                    authentication.getName(),
                                    projectId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    /*
     * =========================================================
     * ADMIN / MANAGER
     * =========================================================
     */

    @GetMapping(
            "/api/site-issues"
    )
    public ResponseEntity<?>
    getAllForManagement(
            Authentication authentication
    ) {

        try {
            return ResponseEntity.ok(
                    siteIssueService
                            .getAllForManagement(
                                    authentication.getName()
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    @GetMapping(
            "/api/site-issues/project/{projectId}"
    )
    public ResponseEntity<?>
    getProjectIssuesForManagement(
            Authentication authentication,
            @PathVariable Long projectId
    ) {

        try {
            return ResponseEntity.ok(
                    siteIssueService
                            .getProjectIssuesForManagement(
                                    authentication.getName(),
                                    projectId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    @GetMapping(
            "/api/site-issues/{issueId}"
    )
    public ResponseEntity<?>
    getIssueForManagement(
            Authentication authentication,
            @PathVariable Long issueId
    ) {

        try {
            return ResponseEntity.ok(
                    siteIssueService
                            .getByIdForManagement(
                                    authentication.getName(),
                                    issueId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    @PutMapping(
            "/api/site-issues/{issueId}/review"
    )
    public ResponseEntity<?>
    reviewIssue(
            Authentication authentication,
            @PathVariable Long issueId,
            @RequestBody ReviewIssueBody body
    ) {

        try {
            return ResponseEntity.ok(
                    siteIssueService
                            .reviewIssue(
                                    authentication.getName(),
                                    issueId,
                                    body.getStatus(),
                                    body.getResolutionNote()
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    public static class ReviewIssueBody {

        private SiteIssue.IssueStatus status;

        private String resolutionNote;

        public SiteIssue.IssueStatus getStatus() {
            return status;
        }

        public void setStatus(
                SiteIssue.IssueStatus status
        ) {
            this.status = status;
        }

        public String getResolutionNote() {
            return resolutionNote;
        }

        public void setResolutionNote(
                String resolutionNote
        ) {
            this.resolutionNote =
                    resolutionNote;
        }
    }
}