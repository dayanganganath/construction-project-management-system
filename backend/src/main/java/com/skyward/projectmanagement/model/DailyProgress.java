package com.skyward.projectmanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "daily_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DailyProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 2000)
    private String workDescription;

    private Integer progressPercentage;

    private Integer workersCount;

    @Column(length = 2000)
    private String remarks;

    @Column(length = 2000)
    private String tomorrowPlan;

    @Column(length = 2000)
    private String issuesBlockers;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
}