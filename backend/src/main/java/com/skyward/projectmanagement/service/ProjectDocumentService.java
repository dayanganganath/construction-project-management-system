package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.ProjectDocument;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.ProjectDocumentRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import com.skyward.projectmanagement.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ProjectDocumentService {

    private static final long MAX_FILE_SIZE =
            25L * 1024L * 1024L;

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of(
                    ".pdf",
                    ".doc",
                    ".docx",
                    ".xls",
                    ".xlsx",
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".webp",
                    ".dwg",
                    ".dxf"
            );

    private final ProjectDocumentRepository
            projectDocumentRepository;

    private final ProjectRepository
            projectRepository;

    private final UserRepository
            userRepository;

    private final SupervisorPortalService
            supervisorPortalService;

    private final Path uploadDirectory;

    public ProjectDocumentService(
            ProjectDocumentRepository projectDocumentRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            SupervisorPortalService supervisorPortalService,
            @Value(
                    "${app.upload.project-documents-dir:uploads/project-documents}"
            )
            String uploadDirectory
    ) {

        this.projectDocumentRepository =
                projectDocumentRepository;

        this.projectRepository =
                projectRepository;

        this.userRepository =
                userRepository;

        this.supervisorPortalService =
                supervisorPortalService;

        this.uploadDirectory =
                Paths.get(
                        uploadDirectory
                )
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(
                    this.uploadDirectory
            );
        } catch (IOException e) {
            throw new RuntimeException(
                    "Unable to create project document upload directory.",
                    e
            );
        }
    }

    /*
     * =========================================================
     * SUPERVISOR
     * =========================================================
     */

    public ProjectDocument
    uploadSupervisorDocument(
            String username,
            Long projectId,
            LocalDate documentDate,
            String title,
            String description,
            ProjectDocument.DocumentType documentType,
            MultipartFile file
    ) {

        if (
                !supervisorPortalService
                        .hasProjectAccess(
                                username,
                                projectId
                        )
        ) {
            throw new RuntimeException(
                    "You do not have access to this project."
            );
        }

        validateUpload(
                title,
                file
        );

        Project project =
                projectRepository
                        .findById(
                                projectId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found."
                                )
                        );

        String originalFileName =
                getSafeOriginalName(
                        file
                );

        String storedFileName =
                saveFile(
                        file,
                        originalFileName
                );

        ProjectDocument document =
                new ProjectDocument();

        document.setDocumentDate(
                documentDate != null
                        ? documentDate
                        : LocalDate.now()
        );

        document.setTitle(
                title.trim()
        );

        document.setDescription(
                description == null ||
                description.isBlank()
                        ? null
                        : description.trim()
        );

        document.setDocumentType(
                documentType != null
                        ? documentType
                        : ProjectDocument.DocumentType.OTHER
        );

        document.setOriginalFileName(
                originalFileName
        );

        document.setStoredFileName(
                storedFileName
        );

        document.setFilePath(
                uploadDirectory
                        .resolve(
                                storedFileName
                        )
                        .toString()
        );

        document.setContentType(
                file.getContentType()
        );

        document.setFileSize(
                file.getSize()
        );

        document.setUploadedBy(
                username
        );

        /*
         * Supervisor cannot expose
         * documents to clients directly.
         */
        document.setClientVisible(
                false
        );

        document.setProject(
                project
        );

        return projectDocumentRepository
                .save(
                        document
                );
    }

    public List<ProjectDocument>
    getSupervisorProjectDocuments(
            String username,
            Long projectId
    ) {

        if (
                !supervisorPortalService
                        .hasProjectAccess(
                                username,
                                projectId
                        )
        ) {
            throw new RuntimeException(
                    "You do not have access to this project."
            );
        }

        return sortedProjectDocuments(
                projectId
        );
    }

    public ProjectDocument
    getSupervisorDocument(
            String username,
            Long projectId,
            Long documentId
    ) {

        if (
                !supervisorPortalService
                        .hasProjectAccess(
                                username,
                                projectId
                        )
        ) {
            throw new RuntimeException(
                    "You do not have access to this project."
            );
        }

        ProjectDocument document =
                getDocumentById(
                        documentId
                );

        validateDocumentProject(
                document,
                projectId
        );

        return document;
    }

    public Resource
    loadSupervisorDocumentFile(
            String username,
            Long projectId,
            Long documentId
    ) {

        ProjectDocument document =
                getSupervisorDocument(
                        username,
                        projectId,
                        documentId
                );

        return loadFile(
                document
        );
    }

    /*
     * =========================================================
     * ADMIN / MANAGER
     * =========================================================
     */

    public List<ProjectDocument>
    getAllForManagement(
            String username
    ) {

        requireManagementUser(
                username
        );

        return projectDocumentRepository
                .findAll()
                .stream()
                .sorted(
                        Comparator
                                .comparing(
                                        ProjectDocument::getDocumentDate,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                                .thenComparing(
                                        ProjectDocument::getId,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                )
                .toList();
    }

    public List<ProjectDocument>
    getProjectDocumentsForManagement(
            String username,
            Long projectId
    ) {

        requireManagementUser(
                username
        );

        if (
                !projectRepository
                        .existsById(
                                projectId
                        )
        ) {
            throw new RuntimeException(
                    "Project not found."
            );
        }

        return sortedProjectDocuments(
                projectId
        );
    }

    public ProjectDocument
    getDocumentForManagement(
            String username,
            Long documentId
    ) {

        requireManagementUser(
                username
        );

        return getDocumentById(
                documentId
        );
    }

    public ProjectDocument
    updateClientVisibility(
            String username,
            Long documentId,
            boolean clientVisible
    ) {

        requireManagementUser(
                username
        );

        ProjectDocument document =
                getDocumentById(
                        documentId
                );

        document.setClientVisible(
                clientVisible
        );

        return projectDocumentRepository
                .save(
                        document
                );
    }

    public Resource
    loadManagementDocumentFile(
            String username,
            Long documentId
    ) {

        requireManagementUser(
                username
        );

        ProjectDocument document =
                getDocumentById(
                        documentId
                );

        return loadFile(
                document
        );
    }

    /*
     * =========================================================
     * HELPERS
     * =========================================================
     */

    private List<ProjectDocument>
    sortedProjectDocuments(
            Long projectId
    ) {

        return projectDocumentRepository
                .findByProjectId(
                        projectId
                )
                .stream()
                .sorted(
                        Comparator
                                .comparing(
                                        ProjectDocument::getDocumentDate,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                                .thenComparing(
                                        ProjectDocument::getId,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                )
                .toList();
    }

    private ProjectDocument
    getDocumentById(
            Long documentId
    ) {

        return projectDocumentRepository
                .findById(
                        documentId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Project document not found."
                        )
                );
    }

    private void validateDocumentProject(
            ProjectDocument document,
            Long projectId
    ) {

        if (
                document.getProject() == null ||
                document.getProject()
                        .getId() == null ||
                !document.getProject()
                        .getId()
                        .equals(
                                projectId
                        )
        ) {
            throw new RuntimeException(
                    "This document does not belong to this project."
            );
        }
    }

    private void validateUpload(
            String title,
            MultipartFile file
    ) {

        if (
                title == null ||
                title.isBlank()
        ) {
            throw new RuntimeException(
                    "Document title is required."
            );
        }

        if (
                file == null ||
                file.isEmpty()
        ) {
            throw new RuntimeException(
                    "Document file is required."
            );
        }

        if (
                file.getSize() >
                MAX_FILE_SIZE
        ) {
            throw new RuntimeException(
                    "File size cannot exceed 25 MB."
            );
        }

        String originalName =
                getSafeOriginalName(
                        file
                );

        String extension =
                getExtension(
                        originalName
                );

        if (
                !ALLOWED_EXTENSIONS
                        .contains(
                                extension
                        )
        ) {
            throw new RuntimeException(
                    "Unsupported file type. Allowed: PDF, Word, Excel, JPG, PNG, WEBP, DWG and DXF."
            );
        }
    }

    private String
    getSafeOriginalName(
            MultipartFile file
    ) {

        String originalName =
                file.getOriginalFilename();

        if (
                originalName == null ||
                originalName.isBlank()
        ) {
            throw new RuntimeException(
                    "Original file name is missing."
            );
        }

        String safeName =
                Paths.get(
                        originalName
                )
                .getFileName()
                .toString();

        if (
                safeName.isBlank()
        ) {
            throw new RuntimeException(
                    "Invalid file name."
            );
        }

        return safeName;
    }

    private String getExtension(
            String fileName
    ) {

        int index =
                fileName.lastIndexOf(
                        "."
                );

        if (
                index < 0 ||
                index ==
                fileName.length() - 1
        ) {
            return "";
        }

        return fileName
                .substring(
                        index
                )
                .toLowerCase(
                        Locale.ROOT
                );
    }

    private String saveFile(
            MultipartFile file,
            String originalName
    ) {

        String extension =
                getExtension(
                        originalName
                );

        String storedFileName =
                UUID.randomUUID()
                        .toString()
                        +
                extension;

        Path destination =
                uploadDirectory
                        .resolve(
                                storedFileName
                        )
                        .normalize();

        if (
                !destination.startsWith(
                        uploadDirectory
                )
        ) {
            throw new RuntimeException(
                    "Invalid upload path."
            );
        }

        try {

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption
                            .REPLACE_EXISTING
            );

            return storedFileName;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Unable to save project document.",
                    e
            );
        }
    }

    private Resource loadFile(
            ProjectDocument document
    ) {

        try {

            Path path =
                    Paths.get(
                            document.getFilePath()
                    )
                    .toAbsolutePath()
                    .normalize();

            Resource resource =
                    new UrlResource(
                            path.toUri()
                    );

            if (
                    !resource.exists() ||
                    !resource.isReadable()
            ) {
                throw new RuntimeException(
                        "Document file not found."
                );
            }

            return resource;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to load document file.",
                    e
            );
        }
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
                    "Only ADMIN or MANAGER users can manage project documents."
            );
        }

        return user;
    }
}