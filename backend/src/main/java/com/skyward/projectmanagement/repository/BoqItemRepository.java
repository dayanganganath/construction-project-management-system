package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.model.BoqItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoqItemRepository extends JpaRepository<BoqItem, Long> {

    List<BoqItem> findByProjectId(Long projectId);
}