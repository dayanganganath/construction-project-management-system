package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkerRepository
        extends JpaRepository<Worker, Long> {

    List<Worker> findByActiveTrue();

    List<Worker> findByTradeTypeIgnoreCase(String tradeType);
}