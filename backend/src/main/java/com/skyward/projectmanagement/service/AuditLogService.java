package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.AuditLog;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.AuditLogRepository;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository
            auditLogRepository;

    private final UserRepository
            userRepository;

    public AuditLogService(
            AuditLogRepository auditLogRepository,
            UserRepository userRepository
    ) {
        this.auditLogRepository =
                auditLogRepository;

        this.userRepository =
                userRepository;
    }

    /*
     * =========================================================
     * CREATE AUDIT LOG
     * =========================================================
     */

    public AuditLog logAction(
            String username,
            String module,
            String action,
            String description,
            Long referenceId,
            String referenceType,
            Project project
    ) {

        String role =
                getUserRole(
                        username
                );

        AuditLog auditLog =
                new AuditLog();

        auditLog.setUsername(
                username
        );

        auditLog.setRole(
                role
        );

        auditLog.setModule(
                module
        );

        auditLog.setAction(
                action
        );

        auditLog.setDescription(
                description
        );

        auditLog.setReferenceId(
                referenceId
        );

        auditLog.setReferenceType(
                referenceType
        );

        auditLog.setProject(
                project
        );

        return auditLogRepository
                .save(
                        auditLog
                );
    }

    /*
     * =========================================================
     * ADMIN / MANAGER READ
     * =========================================================
     */

    public List<AuditLog>
    getAllLogs(
            String username
    ) {

        requireManagementUser(
                username
        );

        return auditLogRepository
                .findAllByOrderByCreatedAtDesc();
    }

    public List<AuditLog>
    getProjectLogs(
            String username,
            Long projectId
    ) {

        requireManagementUser(
                username
        );

        return auditLogRepository
                .findByProjectIdOrderByCreatedAtDesc(
                        projectId
                );
    }

    public List<AuditLog>
    getUserLogs(
            String username,
            String targetUsername
    ) {

        requireManagementUser(
                username
        );

        return auditLogRepository
                .findByUsernameOrderByCreatedAtDesc(
                        targetUsername
                );
    }

    public List<AuditLog>
    getModuleLogs(
            String username,
            String module
    ) {

        requireManagementUser(
                username
        );

        return auditLogRepository
                .findByModuleOrderByCreatedAtDesc(
                        module
                );
    }

    /*
     * =========================================================
     * HELPERS
     * =========================================================
     */

    private String getUserRole(
            String username
    ) {

        if (
                username == null ||
                username.isBlank()
        ) {
            return null;
        }

        return userRepository
                .findByUsername(
                        username
                )
                .map(
                        User::getRole
                )
                .orElse(null);
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
                        .orElseThrow(() ->
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

        if (
                !"ADMIN".equalsIgnoreCase(
                        user.getRole()
                )
                        &&
                !"MANAGER".equalsIgnoreCase(
                        user.getRole()
                )
        ) {
            throw new RuntimeException(
                    "Only ADMIN or MANAGER users can view audit logs."
            );
        }

        return user;
    }
}