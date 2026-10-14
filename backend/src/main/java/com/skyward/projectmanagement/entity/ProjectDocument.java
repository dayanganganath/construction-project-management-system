package com.skyward.projectmanagement.entity;

import com.skyward.projectmanagement.model.Project;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "project_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate documentDate;

    @Column(nullable = false)
    private String title;

    @Column(length = 1500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType documentType = DocumentType.OTHER;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false)
    private String storedFileName;

    @Column(nullable = false)
    private String filePath;

    private String contentType;

    private Long fileSize;

    private String uploadedBy;

    @Column(nullable = false)
    private Boolean clientVisible = false;

    @Column(nullable = false)
    private Boolean contractorVisible = false;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    public enum DocumentType {
        DRAWING,
        BOQ,
        METHOD_STATEMENT,
        APPROVAL,
        REPORT,
        CONTRACT,
        INVOICE,
        SITE_INSTRUCTION,
        OTHER
    }
}