package com.skyward.projectmanagement.entity;

import com.skyward.projectmanagement.model.Project;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "site_issues")
@Getter
@Setter
@AllArgsConstructor
public class SiteIssue {

    public SiteIssue() {
        this.priority = Priority.MEDIUM;
        this.status = IssueStatus.OPEN;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate issueDate;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssueStatus status;

    private String reportedBy;

    private String reviewedBy;

    private LocalDate reviewedDate;

    @Column(length = 2000)
    private String resolutionNote;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum IssueStatus {
        OPEN,
        IN_PROGRESS,
        RESOLVED
    }
}