package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.UserActivationToken;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserActivationTokenRepository
        extends JpaRepository<UserActivationToken, Long> {

    Optional<UserActivationToken>
    findByTokenHash(
            String tokenHash
    );

    List<UserActivationToken>
    findByUserIdAndUsedAtIsNull(
            Long userId
    );
}