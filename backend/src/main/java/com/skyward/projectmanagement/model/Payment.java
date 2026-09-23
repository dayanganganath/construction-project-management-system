package com.skyward.projectmanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate paymentDate;

    private String paymentMethod;

    private String referenceNumber;

    private String notes;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
}