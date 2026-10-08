package com.skyward.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class ClientDashboardDto {

    private Long projectId;

    private String projectName;
    private String location;
    private String description;
    private String status;

    private LocalDate startDate;
    private LocalDate endDate;

    private BigDecimal projectValue;

    private Integer physicalProgress;

    private Long totalProjectDays;
    private Long daysCompleted;
    private Long daysRemaining;

    private BigDecimal totalPaid;
    private BigDecimal paymentBalance;

    private LocalDate latestProgressDate;
    private String latestWorkDescription;
    private Integer latestWorkersCount;
    private String latestRemarks;
}