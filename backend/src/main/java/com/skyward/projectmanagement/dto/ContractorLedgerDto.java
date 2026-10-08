package com.skyward.projectmanagement.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ContractorLedgerDto {

    private Long contractorId;
    private String contractorName;
    private String contractorType;
    private String tradeType;
    private String phone;

    private BigDecimal totalGrossAmount = BigDecimal.ZERO;
    private BigDecimal totalNetPayable = BigDecimal.ZERO;
    private BigDecimal totalPaidAmount = BigDecimal.ZERO;
    private BigDecimal totalOutstanding = BigDecimal.ZERO;

    private BigDecimal totalPayments = BigDecimal.ZERO;
    private BigDecimal unallocatedPayments = BigDecimal.ZERO;

    private int totalBills;
    private int paidBills;
    private int partiallyPaidBills;
    private int unpaidBills;

    private List<BillItem> bills = new ArrayList<>();
    private List<PaymentItem> payments = new ArrayList<>();

    @Getter
    @Setter
    public static class BillItem {

        private Long id;
        private String billNumber;
        private LocalDate billDate;

        private Long projectId;
        private String projectName;
        private String location;

        private String workDescription;

        private BigDecimal grossAmount;
        private BigDecimal netPayable;
        private BigDecimal paidAmount;
        private BigDecimal balanceAmount;

        private String status;
    }

    @Getter
    @Setter
    public static class PaymentItem {

        private Long id;
        private LocalDate paymentDate;

        private Long projectId;
        private String projectName;
        private String location;

        private Long contractorBillId;
        private String billNumber;

        private BigDecimal amount;

        private String paymentMethod;
        private String referenceNumber;
        private String notes;
        private String slipFileName;
    }
}