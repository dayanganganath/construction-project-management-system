package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.model.ProjectExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectExpenseRepository extends JpaRepository<ProjectExpense, Long> {

    List<ProjectExpense> findByProjectId(Long projectId);
}