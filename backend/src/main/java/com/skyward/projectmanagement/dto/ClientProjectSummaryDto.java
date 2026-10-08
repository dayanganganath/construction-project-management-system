package com.skyward.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class ClientProjectSummaryDto {

    private Long projectId;

    private String projectName;
    private String location;
    private String description;

    private LocalDate startDate;
    private LocalDate endDate;

    private String status;

    private BigDecimal projectValue;
}