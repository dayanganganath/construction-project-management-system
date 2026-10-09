package com.skyward.projectmanagement.entity;

import com.skyward.projectmanagement.model.Project;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "labour_attendance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LabourAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceType attendanceType;

    @Column(nullable = false)
    private BigDecimal dailyRate = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal otAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal totalEarned = BigDecimal.ZERO;

    private String notes;

    @ManyToOne
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker worker;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    public enum AttendanceType {
        FULL_DAY,
        HALF_DAY,
        ABSENT
    }
}