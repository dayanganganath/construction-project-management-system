package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.LabourPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LabourPaymentRepository
        extends JpaRepository<LabourPayment, Long> {

    List<LabourPayment> findByProjectId(Long projectId);

    List<LabourPayment> findByWorkerId(Long workerId);

    List<LabourPayment> findByPaymentDate(LocalDate paymentDate);

    List<LabourPayment> findByProjectIdAndPaymentDate(
            Long projectId,
            LocalDate paymentDate
    );
}