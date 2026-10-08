package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.UserProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserProjectAssignmentRepository
        extends JpaRepository<UserProjectAssignment, Long> {

    List<UserProjectAssignment> findByUserId(Long userId);

    List<UserProjectAssignment> findByProjectId(Long projectId);

    Optional<UserProjectAssignment>
    findByUserIdAndProjectId(
            Long userId,
            Long projectId
    );

    boolean existsByUserIdAndProjectId(
            Long userId,
            Long projectId
    );
}