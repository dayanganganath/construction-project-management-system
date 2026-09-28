package com.skyward.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "contractors")
@Getter
@Setter
public class Contractor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // CONTRACTOR / SUBCONTRACTOR

    private String tradeType;

    private String phone;

    private String address;

    private String nicOrRegistrationNo;

    private String bankName;

    private String bankAccountName;

    private String bankAccountNumber;

    @Column(nullable = false)
    private Boolean active = true;
}