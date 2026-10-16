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

    public ProjectDocument(Long id, LocalDate documentDate, String title, String description,
                           DocumentType documentType, String originalFileName, String storedFileName,
                           String filePath, String contentType, Long fileSize, String uploadedBy,
                           Boolean clientVisible, Boolean contractorVisible, Project project) {
        this.id = id;
        this.documentDate = documentDate;
        this.title = title;
        this.description = description;
        this.documentType = documentType;
        this.originalFileName = originalFileName;
        this.storedFileName = storedFileName;
        this.filePath = filePath;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.uploadedBy = uploadedBy;
        this.clientVisible = clientVisible;
        this.contractorVisible = contractorVisible;
        this.project = project;
    }

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