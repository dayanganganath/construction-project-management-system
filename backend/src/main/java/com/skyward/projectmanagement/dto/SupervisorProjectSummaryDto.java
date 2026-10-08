package com.skyward.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class SupervisorProjectSummaryDto {

    private Long projectId;
    private String projectName;
    private String location;
    private String description;
    private String status;

    private LocalDate startDate;
    private LocalDate endDate;

    private LocalDate latestProgressDate;
    private Integer latestProgressPercentage;
    private Integer latestWorkersCount;
    private String latestWorkDescription;
    private String latestRemarks;
}