package com.skyward.projectmanagement.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class SiteReportSummaryDto {

    private Long projectId;
    private String projectName;
    private String location;
    private String status;

    private LocalDate startDate;
    private LocalDate endDate;

    private SiteCostSummaryDto financialSummary;

    private LocalDate latestProgressDate;
    private Integer latestProgressPercentage;
    private Integer latestWorkersCount;
    private String latestWorkDescription;
    private String latestRemarks;

    private int totalProgressEntries;
}