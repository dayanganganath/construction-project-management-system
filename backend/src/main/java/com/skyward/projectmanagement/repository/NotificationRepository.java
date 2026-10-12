package com.skyward.projectmanagement.repository;

import com.skyward.projectmanagement.entity.Notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository
        extends JpaRepository<
        Notification,
        Long
        > {

    List<Notification>
    findAllByOrderByCreatedAtDesc();

    List<Notification>
    findByReadStatusFalseOrderByCreatedAtDesc();

    long countByReadStatusFalse();

    List<Notification>
    findByProjectIdOrderByCreatedAtDesc(
            Long projectId
    );
}