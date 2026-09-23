package com.skyward.projectmanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String projectName;

    private String location;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    private String status;

    private BigDecimal budget;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;
}