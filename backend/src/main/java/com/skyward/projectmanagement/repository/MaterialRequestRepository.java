package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.MaterialRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterialRequestRepository
        extends JpaRepository<MaterialRequest, Long> {

    List<MaterialRequest> findByProjectId(Long projectId);

    List<MaterialRequest> findByRequestedBy(String requestedBy);

    List<MaterialRequest> findByStatus(
            MaterialRequest.RequestStatus status
    );
}