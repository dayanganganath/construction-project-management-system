package com.skyward.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            nullable = false,
            unique = true
    )
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role = "CLIENT";

    @Column(nullable = false)
    private Boolean active = true;

    /*
     * =========================================================
     * PROFILE
     * =========================================================
     */

    @Column(length = 150)
    private String fullName;

    @Column(length = 190)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(length = 500)
    private String profilePhotoPath;

    @Column(length = 100)
    private String profilePhotoContentType;
}