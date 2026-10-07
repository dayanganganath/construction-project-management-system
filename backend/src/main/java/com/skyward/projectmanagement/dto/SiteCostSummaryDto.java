package com.skyward.projectmanagement.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class SiteCostSummaryDto {

    private Long projectId;
    private String projectName;
    private String location;

    private int totalContractorBills;
    private int unpaidBills;
    private int partiallyPaidBills;
    private int paidBills;

    private BigDecimal contractorGrossAmount;
    private BigDecimal contractorNetPayable;
    private BigDecimal contractorPaidAmount;
    private BigDecimal contractorOutstandingAmount;

    private BigDecimal subcontractorPayments;
    private BigDecimal projectExpenses;
    private BigDecimal clientPayments;

    private BigDecimal totalOutgoing;
    private BigDecimal netCashPosition;
}