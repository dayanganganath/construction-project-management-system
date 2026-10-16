package com.skyward.projectmanagement.entity;

import com.skyward.projectmanagement.model.Project;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "site_photos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SitePhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate photoDate;

    @Column(nullable = false)
    private String category;

    @Column(length = 1000)
    private String caption;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    private String uploadedBy;

    @Column(nullable = false)
    private Boolean clientVisible;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @PrePersist
    private void applyDefaultClientVisibility() {
        if (clientVisible == null) {
            clientVisible = false;
        }
    }
}