package com.skyward.projectmanagement.entity;

import com.skyward.projectmanagement.model.Project;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "contractor_bills")
@Getter
@Setter
public class ContractorBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String billNumber;

    private LocalDate billDate;

    private LocalDate periodFrom;

    private LocalDate periodTo;

    private String workDescription;

    @Column(nullable = false)
    private BigDecimal grossAmount = BigDecimal.ZERO;

    private BigDecimal retention = BigDecimal.ZERO;

    private BigDecimal advanceRecovery = BigDecimal.ZERO;

    private BigDecimal otherDeductions = BigDecimal.ZERO;

    private BigDecimal netPayable = BigDecimal.ZERO;

    private BigDecimal paidAmount = BigDecimal.ZERO;

    private BigDecimal balanceAmount = BigDecimal.ZERO;

    private String status;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "contractor_id", nullable = false)
    private Contractor contractor;

    @PrePersist
    @PreUpdate
    public void calculateAmounts() {

        BigDecimal gross =
                grossAmount != null
                        ? grossAmount
                        : BigDecimal.ZERO;

        BigDecimal retentionValue =
                retention != null
                        ? retention
                        : BigDecimal.ZERO;

        BigDecimal advanceValue =
                advanceRecovery != null
                        ? advanceRecovery
                        : BigDecimal.ZERO;

        BigDecimal otherValue =
                otherDeductions != null
                        ? otherDeductions
                        : BigDecimal.ZERO;

        BigDecimal paid =
                paidAmount != null
                        ? paidAmount
                        : BigDecimal.ZERO;

        netPayable = gross
                .subtract(retentionValue)
                .subtract(advanceValue)
                .subtract(otherValue);

        balanceAmount =
                netPayable.subtract(paid);

        if (balanceAmount.compareTo(BigDecimal.ZERO) <= 0) {
            status = "PAID";

        } else if (paid.compareTo(BigDecimal.ZERO) > 0) {
            status = "PARTIALLY_PAID";

        } else {
            status = "UNPAID";
        }
    }
}