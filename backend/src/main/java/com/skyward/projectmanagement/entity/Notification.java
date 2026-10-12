package com.skyward.projectmanagement.entity;

import com.skyward.projectmanagement.model.Project;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(
            nullable = false,
            length = 2000
    )
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private Boolean readStatus = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private String createdBy;

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

        if (readStatus == null) {
            readStatus = false;
        }
    }

    public enum NotificationType {
        MATERIAL_REQUEST,
        SITE_ISSUE,
        DOCUMENT_UPLOAD,
        SITE_PHOTO,
        GENERAL
    }

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title
    ) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(
            String message
    ) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(
            NotificationType type
    ) {
        this.type = type;
    }

    public Boolean getReadStatus() {
        return readStatus;
    }

    public void setReadStatus(
            Boolean readStatus
    ) {
        this.readStatus = readStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(
            String createdBy
    ) {
        this.createdBy = createdBy;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(
            Long referenceId
    ) {
        this.referenceId = referenceId;
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