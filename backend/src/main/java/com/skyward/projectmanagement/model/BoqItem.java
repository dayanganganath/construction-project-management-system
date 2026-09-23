package com.skyward.projectmanagement.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "boq_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BoqItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String itemDescription;

    private String specification;

    @Column(nullable = false)
    private BigDecimal quantity;

    @Column(nullable = false)
    private String unit;

    @Column(nullable = false)
    private BigDecimal rate;

    @Column(nullable = false)
    private BigDecimal total;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @PrePersist
    @PreUpdate
    public void calculateTotal() {
        if (quantity != null && rate != null) {
            total = quantity.multiply(rate);
        }
    }
}