package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.Contractor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContractorRepository extends JpaRepository<Contractor, Long> {

    List<Contractor> findByActiveTrue();
}