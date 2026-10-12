package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.AuditLog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository
        extends JpaRepository<
        AuditLog,
        Long
        > {

    List<AuditLog>
    findAllByOrderByCreatedAtDesc();

    List<AuditLog>
    findByProjectIdOrderByCreatedAtDesc(
            Long projectId
    );

    List<AuditLog>
    findByUsernameOrderByCreatedAtDesc(
            String username
    );

    List<AuditLog>
    findByModuleOrderByCreatedAtDesc(
            String module
    );
}