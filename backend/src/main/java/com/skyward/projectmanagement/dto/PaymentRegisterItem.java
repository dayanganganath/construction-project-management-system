package com.skyward.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class PaymentRegisterItem {

    private Long sourceId;

    private String sourceType;

    private LocalDate date;

    private Long projectId;

    private String projectName;

    private String location;

    private String partyName;

    private String description;

    private String category;

    private String paymentMethod;

    private String referenceNumber;

    private BigDecimal amount;

    private String direction;

    private String slipFileName;
}