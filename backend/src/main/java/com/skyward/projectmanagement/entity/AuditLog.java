package com.skyward.projectmanagement.entity;

import com.skyward.projectmanagement.model.Project;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String username;

    private String role;

    @Column(nullable = false)
    private String module;

    @Column(nullable = false)
    private String action;

    @Column(length = 2000)
    private String description;

    private Long referenceId;

    private String referenceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt =
                    LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt =
                createdAt;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(
            String username
    ) {
        this.username =
                username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(
            String role
    ) {
        this.role = role;
    }

    public String getModule() {
        return module;
    }

    public void setModule(
            String module
    ) {
        this.module = module;
    }

    public String getAction() {
        return action;
    }

    public void setAction(
            String action
    ) {
        this.action = action;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description =
                description;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(
            Long referenceId
    ) {
        this.referenceId =
                referenceId;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(
            String referenceType
    ) {
        this.referenceType =
                referenceType;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(
            Project project
    ) {
        this.project = project;
    }
}