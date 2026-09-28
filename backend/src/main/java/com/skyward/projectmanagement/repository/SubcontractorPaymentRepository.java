package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.SubcontractorPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubcontractorPaymentRepository
        extends JpaRepository<SubcontractorPayment, Long> {

    List<SubcontractorPayment> findByProjectId(Long projectId);

    List<SubcontractorPayment> findByContractorId(Long contractorId);

    List<SubcontractorPayment> findByContractorBillId(Long contractorBillId);
}