package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.LabourAttendance;
import com.skyward.projectmanagement.entity.Worker;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.LabourAttendanceRepository;
import com.skyward.projectmanagement.repository.ProjectRepository;
import com.skyward.projectmanagement.repository.WorkerRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class LabourAttendanceService {

    private final LabourAttendanceRepository attendanceRepository;
    private final WorkerRepository workerRepository;
    private final ProjectRepository projectRepository;

    public LabourAttendanceService(
            LabourAttendanceRepository attendanceRepository,
            WorkerRepository workerRepository,
            ProjectRepository projectRepository
    ) {
        this.attendanceRepository = attendanceRepository;
        this.workerRepository = workerRepository;
        this.projectRepository = projectRepository;
    }

    public List<LabourAttendance> getAll() {
        return attendanceRepository.findAll();
    }

    public LabourAttendance getById(Long id) {
        return attendanceRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Labour attendance record not found"
                        )
                );
    }

    public List<LabourAttendance> getByProject(Long projectId) {
        return attendanceRepository.findByProjectId(projectId);
    }

    public List<LabourAttendance> getByWorker(Long workerId) {
        return attendanceRepository.findByWorkerId(workerId);
    }

    public List<LabourAttendance> getByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    public List<LabourAttendance> getByProjectAndDate(
            Long projectId,
            LocalDate date
    ) {
        return attendanceRepository
                .findByProjectIdAndDate(
                        projectId,
                        date
                );
    }

    public LabourAttendance create(
            LabourAttendance attendance
    ) {

        validate(attendance);

        Worker worker =
                workerRepository
                        .findById(
                                attendance
                                        .getWorker()
                                        .getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Worker not found"
                                )
                        );

        Project project =
                projectRepository
                        .findById(
                                attendance
                                        .getProject()
                                        .getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found"
                                )
                        );

        attendance.setWorker(worker);
        attendance.setProject(project);

        if (attendance.getDailyRate() == null) {
            attendance.setDailyRate(
                    worker.getDefaultDailyRate()
            );
        }

        if (attendance.getOtAmount() == null) {
            attendance.setOtAmount(
                    BigDecimal.ZERO
            );
        }

        attendance.setTotalEarned(
                calculateTotal(attendance)
        );

        return attendanceRepository.save(attendance);
    }

    public LabourAttendance update(
            Long id,
            LabourAttendance updated
    ) {

        validate(updated);

        LabourAttendance attendance =
                getById(id);

        Worker worker =
                workerRepository
                        .findById(
                                updated
                                        .getWorker()
                                        .getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Worker not found"
                                )
                        );

        Project project =
                projectRepository
                        .findById(
                                updated
                                        .getProject()
                                        .getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Project not found"
                                )
                        );

        attendance.setDate(
                updated.getDate()
        );

        attendance.setAttendanceType(
                updated.getAttendanceType()
        );

        attendance.setDailyRate(
                updated.getDailyRate() != null
                        ? updated.getDailyRate()
                        : worker.getDefaultDailyRate()
        );

        attendance.setOtAmount(
                updated.getOtAmount() != null
                        ? updated.getOtAmount()
                        : BigDecimal.ZERO
        );

        attendance.setNotes(
                updated.getNotes()
        );

        attendance.setWorker(worker);
        attendance.setProject(project);

        attendance.setTotalEarned(
                calculateTotal(attendance)
        );

        return attendanceRepository.save(attendance);
    }

    public void delete(Long id) {
        LabourAttendance attendance =
                getById(id);

        attendanceRepository.delete(attendance);
    }

    private BigDecimal calculateTotal(
            LabourAttendance attendance
    ) {

        BigDecimal dailyRate =
                attendance.getDailyRate() != null
                        ? attendance.getDailyRate()
                        : BigDecimal.ZERO;

        BigDecimal baseAmount =
                switch (attendance.getAttendanceType()) {

                    case FULL_DAY ->
                            dailyRate;

                    case HALF_DAY ->
                            dailyRate.divide(
                                    new BigDecimal("2"),
                                    2,
                                    RoundingMode.HALF_UP
                            );

                    case ABSENT ->
                            BigDecimal.ZERO;
                };

        BigDecimal otAmount =
                attendance.getOtAmount() != null
                        ? attendance.getOtAmount()
                        : BigDecimal.ZERO;

        return baseAmount.add(otAmount);
    }

    private void validate(
            LabourAttendance attendance
    ) {

        if (attendance.getDate() == null) {
            throw new RuntimeException(
                    "Date is required"
            );
        }

        if (attendance.getAttendanceType() == null) {
            throw new RuntimeException(
                    "Attendance type is required"
            );
        }

        if (
                attendance.getWorker() == null
                        ||
                attendance.getWorker().getId() == null
        ) {
            throw new RuntimeException(
                    "Worker ID is required"
            );
        }

        if (
                attendance.getProject() == null
                        ||
                attendance.getProject().getId() == null
        ) {
            throw new RuntimeException(
                    "Project ID is required"
            );
        }

        if (
                attendance.getDailyRate() != null
                        &&
                attendance.getDailyRate()
                        .compareTo(BigDecimal.ZERO) < 0
        ) {
            throw new RuntimeException(
                    "Daily rate cannot be negative"
            );
        }

        if (
                attendance.getOtAmount() != null
                        &&
                attendance.getOtAmount()
                        .compareTo(BigDecimal.ZERO) < 0
        ) {
            throw new RuntimeException(
                    "OT amount cannot be negative"
            );
        }
    }
}