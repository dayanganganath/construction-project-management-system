package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.SitePhoto;
import com.skyward.projectmanagement.entity.User;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.ProjectRepository;
import com.skyward.projectmanagement.repository.SitePhotoRepository;
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
import java.util.UUID;

@Service
public class SitePhotoService {

    private final SitePhotoRepository sitePhotoRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SupervisorPortalService supervisorPortalService;

    private final Path uploadDirectory;

    public SitePhotoService(
            SitePhotoRepository sitePhotoRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            SupervisorPortalService supervisorPortalService,
            @Value(
                    "${app.upload.site-photos-dir:uploads/site-photos}"
            )
            String uploadDirectory
    ) {
        this.sitePhotoRepository =
                sitePhotoRepository;

        this.projectRepository =
                projectRepository;

        this.userRepository =
                userRepository;

        this.supervisorPortalService =
                supervisorPortalService;

        this.uploadDirectory =
                Paths.get(uploadDirectory)
                        .toAbsolutePath()
                        .normalize();

        try {
            Files.createDirectories(
                    this.uploadDirectory
            );
        } catch (IOException e) {
            throw new RuntimeException(
                    "Unable to create site photo upload directory.",
                    e
            );
        }
    }

    /*
     * =========================================================
     * SUPERVISOR
     * =========================================================
     */

    public SitePhoto uploadSupervisorPhoto(
            String username,
            Long projectId,
            LocalDate photoDate,
            String category,
            String caption,
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

        validatePhoto(
                photoDate,
                category,
                file
        );

        Project project =
                projectRepository
                        .findById(projectId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found."
                                )
                        );

        String storedFileName =
                saveFile(file);

        SitePhoto photo =
                new SitePhoto();

        photo.setPhotoDate(
                photoDate
        );

        photo.setCategory(
                category.trim()
                        .toUpperCase()
        );

        photo.setCaption(
                caption == null ||
                        caption.isBlank()
                        ? null
                        : caption.trim()
        );

        photo.setFileName(
                storedFileName
        );

        photo.setFilePath(
                uploadDirectory
                        .resolve(
                                storedFileName
                        )
                        .toString()
        );

        photo.setUploadedBy(
                username
        );

        /*
         * Supervisor cannot make a photo
         * client-visible directly.
         */
        photo.setClientVisible(
                false
        );

        photo.setProject(
                project
        );

        return sitePhotoRepository
                .save(photo);
    }

    public List<SitePhoto>
    getSupervisorProjectPhotos(
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

        return sortedProjectPhotos(
                projectId
        );
    }

    /*
     * =========================================================
     * ADMIN / MANAGER
     * =========================================================
     */

    public List<SitePhoto>
    getProjectPhotosForManagement(
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

        return sortedProjectPhotos(
                projectId
        );
    }

    public SitePhoto updateClientVisibility(
            String username,
            Long photoId,
            boolean clientVisible
    ) {

        requireManagementUser(
                username
        );

        SitePhoto photo =
                getPhotoById(
                        photoId
                );

        photo.setClientVisible(
                clientVisible
        );

        return sitePhotoRepository
                .save(photo);
    }

    /*
     * =========================================================
     * FILE
     * =========================================================
     */

    public Resource loadPhotoFile(
            Long photoId
    ) {

        SitePhoto photo =
                getPhotoById(
                        photoId
                );

        try {
            Path path =
                    Paths.get(
                            photo.getFilePath()
                    )
                    .normalize();

            Resource resource =
                    new UrlResource(
                            path.toUri()
                    );

            if (
                    !resource.exists()
                            ||
                    !resource.isReadable()
            ) {
                throw new RuntimeException(
                        "Photo file not found."
                );
            }

            return resource;

        } catch (Exception e) {
            throw new RuntimeException(
                    "Unable to load photo file.",
                    e
            );
        }
    }

    public SitePhoto getPhotoById(
            Long photoId
    ) {

        return sitePhotoRepository
                .findById(photoId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Site photo not found."
                        )
                );
    }

    /*
     * =========================================================
     * HELPERS
     * =========================================================
     */

    private List<SitePhoto>
    sortedProjectPhotos(
            Long projectId
    ) {

        return sitePhotoRepository
                .findByProjectId(
                        projectId
                )
                .stream()
                .sorted(
                        Comparator
                                .comparing(
                                        SitePhoto::getPhotoDate,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                                .thenComparing(
                                        SitePhoto::getId,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                )
                .toList();
    }

    private String saveFile(
            MultipartFile file
    ) {

        String originalName =
                file.getOriginalFilename();

        String extension = "";

        if (
                originalName != null
                        &&
                originalName.contains(".")
        ) {
            extension =
                    originalName.substring(
                            originalName
                                    .lastIndexOf(".")
                    );
        }

        String storedFileName =
                UUID.randomUUID()
                        +
                extension.toLowerCase();

        Path destination =
                uploadDirectory.resolve(
                        storedFileName
                );

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
                    "Unable to save site photo.",
                    e
            );
        }
    }

    private void validatePhoto(
            LocalDate photoDate,
            String category,
            MultipartFile file
    ) {

        if (photoDate == null) {
            throw new RuntimeException(
                    "Photo date is required."
            );
        }

        if (
                category == null
                        ||
                category.isBlank()
        ) {
            throw new RuntimeException(
                    "Photo category is required."
            );
        }

        if (
                file == null
                        ||
                file.isEmpty()
        ) {
            throw new RuntimeException(
                    "Photo file is required."
            );
        }

        String contentType =
                file.getContentType();

        boolean allowed =
                "image/jpeg"
                        .equalsIgnoreCase(
                                contentType
                        )
                        ||
                "image/png"
                        .equalsIgnoreCase(
                                contentType
                        )
                        ||
                "image/webp"
                        .equalsIgnoreCase(
                                contentType
                        );

        if (!allowed) {
            throw new RuntimeException(
                    "Only JPG, PNG and WEBP images are allowed."
            );
        }
    }

    private User requireManagementUser(
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
                !"ADMIN"
                        .equalsIgnoreCase(
                                user.getRole()
                        )
                        &&
                !"MANAGER"
                        .equalsIgnoreCase(
                                user.getRole()
                        )
        ) {
            throw new RuntimeException(
                    "Only ADMIN or MANAGER users can manage site photos."
            );
        }

        return user;
    }
}