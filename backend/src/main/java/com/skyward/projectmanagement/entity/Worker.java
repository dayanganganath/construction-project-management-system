package com.skyward.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "workers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String nic;

    private String phone;

    private String tradeType;

    @Column(nullable = false)
    private BigDecimal defaultDailyRate = BigDecimal.ZERO;

    @Column(nullable = false)
    private Boolean active = true;
}