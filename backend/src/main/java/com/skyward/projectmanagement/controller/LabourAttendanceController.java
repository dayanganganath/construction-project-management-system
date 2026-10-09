package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.LabourAttendance;
import com.skyward.projectmanagement.service.LabourAttendanceService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/labour-attendance")
@CrossOrigin(origins = "http://localhost:5173")
public class LabourAttendanceController {

    private final LabourAttendanceService labourAttendanceService;

    public LabourAttendanceController(
            LabourAttendanceService labourAttendanceService
    ) {
        this.labourAttendanceService =
                labourAttendanceService;
    }

    @GetMapping
    public List<LabourAttendance> getAll() {
        return labourAttendanceService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(
                    labourAttendanceService.getById(id)
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/project/{projectId}")
    public List<LabourAttendance> getByProject(
            @PathVariable Long projectId
    ) {
        return labourAttendanceService
                .getByProject(projectId);
    }

    @GetMapping("/worker/{workerId}")
    public List<LabourAttendance> getByWorker(
            @PathVariable Long workerId
    ) {
        return labourAttendanceService
                .getByWorker(workerId);
    }

    @GetMapping("/date/{date}")
    public List<LabourAttendance> getByDate(
            @PathVariable LocalDate date
    ) {
        return labourAttendanceService
                .getByDate(date);
    }

    @GetMapping("/project/{projectId}/date/{date}")
    public List<LabourAttendance> getByProjectAndDate(
            @PathVariable Long projectId,
            @PathVariable LocalDate date
    ) {
        return labourAttendanceService
                .getByProjectAndDate(
                        projectId,
                        date
                );
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody LabourAttendance attendance
    ) {
        try {
            return ResponseEntity.ok(
                    labourAttendanceService
                            .create(attendance)
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody LabourAttendance attendance
    ) {
        try {
            return ResponseEntity.ok(
                    labourAttendanceService
                            .update(
                                    id,
                                    attendance
                            )
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id
    ) {
        try {
            labourAttendanceService
                    .delete(id);

            return ResponseEntity
                    .noContent()
                    .build();
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}