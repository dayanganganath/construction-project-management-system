package com.skyward.projectmanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "contractors")
@Getter
@Setter
public class Contractor {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    private String tradeType;

    private String phone;

    private String address;

    private String nicOrRegistrationNo;

    private String bankName;

    private String bankAccountName;

    private String bankAccountNumber;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            unique = true
    )
    @JsonIgnore
    private User user;
}