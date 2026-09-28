package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.ContractorBill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContractorBillRepository
        extends JpaRepository<ContractorBill, Long> {

    List<ContractorBill> findByProjectId(Long projectId);

    List<ContractorBill> findByContractorId(Long contractorId);
}