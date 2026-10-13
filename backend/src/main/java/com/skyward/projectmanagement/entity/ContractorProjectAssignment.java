package com.skyward.projectmanagement.entity;

import com.skyward.projectmanagement.model.Project;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(
        name = "contractor_project_assignments",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "contractor_id",
                                "project_id"
                        }
                )
        }
)
@Getter
@Setter
public class ContractorProjectAssignment {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
            name = "contractor_id",
            nullable = false
    )
    private Contractor contractor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
            name = "project_id",
            nullable = false
    )
    private Project project;

    @Column(nullable = false)
    private Boolean active = true;

    private LocalDate assignedDate;

    @PrePersist
    public void prePersist() {

        if (active == null) {
            active = true;
        }

        if (assignedDate == null) {
            assignedDate =
                    LocalDate.now();
        }
    }
}