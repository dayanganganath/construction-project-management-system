package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.PasswordResetCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {

    Optional<PasswordResetCode> findTopByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(Long userId);

    List<PasswordResetCode> findByUserIdAndUsedAtIsNull(Long userId);
}
