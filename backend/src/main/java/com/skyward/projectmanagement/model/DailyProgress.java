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

    @Column(nullable = false)
    private String workDescription;

    private Integer progressPercentage;

    private Integer workersCount;

    private String remarks;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
}