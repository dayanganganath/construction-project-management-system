package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.AuditLog;
import com.skyward.projectmanagement.service.AuditLogService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogService
            auditLogService;

    public AuditLogController(
            AuditLogService auditLogService
    ) {
        this.auditLogService =
                auditLogService;
    }

    @GetMapping
    public ResponseEntity<
            List<AuditLog>
            >
    getAllLogs(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                auditLogService
                        .getAllLogs(
                                authentication
                                        .getName()
                        )
        );
    }

    @GetMapping(
            "/project/{projectId}"
    )
    public ResponseEntity<
            List<AuditLog>
            >
    getProjectLogs(
            @PathVariable
            Long projectId,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                auditLogService
                        .getProjectLogs(
                                authentication
                                        .getName(),
                                projectId
                        )
        );
    }

    @GetMapping(
            "/user/{username}"
    )
    public ResponseEntity<
            List<AuditLog>
            >
    getUserLogs(
            @PathVariable
            String username,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                auditLogService
                        .getUserLogs(
                                authentication
                                        .getName(),
                                username
                        )
        );
    }

    @GetMapping(
            "/module/{module}"
    )
    public ResponseEntity<
            List<AuditLog>
            >
    getModuleLogs(
            @PathVariable
            String module,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                auditLogService
                        .getModuleLogs(
                                authentication
                                        .getName(),
                                module
                        )
        );
    }
}