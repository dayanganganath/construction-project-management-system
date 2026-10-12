package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.SitePhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SitePhotoRepository
        extends JpaRepository<SitePhoto, Long> {

    List<SitePhoto> findByProjectId(Long projectId);

    List<SitePhoto> findByProjectIdAndClientVisibleTrue(
            Long projectId
    );
}