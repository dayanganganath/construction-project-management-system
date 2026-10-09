package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.LabourAttendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LabourAttendanceRepository
        extends JpaRepository<LabourAttendance, Long> {

    List<LabourAttendance> findByProjectId(Long projectId);

    List<LabourAttendance> findByWorkerId(Long workerId);

    List<LabourAttendance> findByDate(LocalDate date);

    List<LabourAttendance> findByProjectIdAndDate(
            Long projectId,
            LocalDate date
    );
}