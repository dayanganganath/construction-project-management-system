package com.skyward.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_activation_tokens",
        indexes = {
                @Index(
                        name = "idx_activation_token_hash",
                        columnList = "token_hash",
                        unique = true
                ),
                @Index(
                        name = "idx_activation_user_id",
                        columnList = "user_id"
                )
        }
)
@Getter
@Setter
public class UserActivationToken {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @Column(
            name = "token_hash",
            nullable = false,
            unique = true,
            length = 64
    )
    private String tokenHash;

    @Column(
            name = "expires_at",
            nullable = false
    )
    private LocalDateTime expiresAt;

    @Column(
            name = "used_at"
    )
    private LocalDateTime usedAt;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "created_by",
            length = 100
    )
    private String createdBy;

    @PrePersist
    public void prePersist() {

        if (createdAt == null) {
            createdAt =
                    LocalDateTime.now();
        }
    }

    public boolean isUsed() {

        return usedAt != null;
    }

    public boolean isExpired() {

        return expiresAt == null ||
                expiresAt.isBefore(
                        LocalDateTime.now()
                );
    }
}