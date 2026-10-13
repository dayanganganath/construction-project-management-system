package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.Contractor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractorRepository
        extends JpaRepository<Contractor, Long> {

    List<Contractor> findByActiveTrue();

    Optional<Contractor> findByNameIgnoreCase(
            String name
    );

    /*
     * Find contractor linked to
     * logged-in username.
     */
    Optional<Contractor> findByUserUsername(
            String username
    );

    /*
     * Find contractor linked
     * to a specific user ID.
     */
    Optional<Contractor> findByUserId(
            Long userId
    );

    /*
     * Prevent same user account
     * from being linked twice.
     */
    boolean existsByUserId(
            Long userId
    );
}