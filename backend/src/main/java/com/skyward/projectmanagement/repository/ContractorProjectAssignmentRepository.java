package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.ContractorProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContractorProjectAssignmentRepository
        extends JpaRepository<
        ContractorProjectAssignment,
        Long
        > {

    List<ContractorProjectAssignment>
    findByContractorIdAndActiveTrue(
            Long contractorId
    );

    List<ContractorProjectAssignment>
    findByProjectIdAndActiveTrue(
            Long projectId
    );

    Optional<ContractorProjectAssignment>
    findByContractorIdAndProjectId(
            Long contractorId,
            Long projectId
    );

    boolean existsByContractorIdAndProjectIdAndActiveTrue(
            Long contractorId,
            Long projectId
    );

    void deleteByContractorIdAndProjectId(
            Long contractorId,
            Long projectId
    );
}