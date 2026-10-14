package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.ProjectDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectDocumentRepository
        extends JpaRepository<ProjectDocument, Long> {

    List<ProjectDocument> findByProjectId(
            Long projectId
    );

    List<ProjectDocument> findByProjectIdAndClientVisibleTrue(
            Long projectId
    );

    List<ProjectDocument> findByProjectIdAndContractorVisibleTrue(
            Long projectId
    );

    List<ProjectDocument> findByDocumentType(
            ProjectDocument.DocumentType documentType
    );

    List<ProjectDocument> findByUploadedBy(
            String uploadedBy
    );
}