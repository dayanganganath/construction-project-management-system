package com.skyward.projectmanagement.entity;

import com.skyward.projectmanagement.model.Project;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "material_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MaterialRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate requestDate;

    @Column(nullable = false)
    private String materialName;

    @Column(nullable = false)
    private BigDecimal quantity;

    @Column(nullable = false)
    private String unit;

    @Column(length = 1000)
    private String purpose;

    @Column(length = 1000)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    private String requestedBy;

    private String reviewedBy;

    private LocalDate reviewedDate;

    @Column(length = 1000)
    private String reviewRemarks;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @PrePersist
    private void setDefaultStatus() {
        if (status == null) {
            status = RequestStatus.PENDING;
        }
    }

    public enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}