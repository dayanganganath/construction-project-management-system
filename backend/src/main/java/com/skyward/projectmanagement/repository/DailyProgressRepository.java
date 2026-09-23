package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.model.DailyProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DailyProgressRepository extends JpaRepository<DailyProgress, Long> {

    List<DailyProgress> findByProjectId(Long projectId);
}