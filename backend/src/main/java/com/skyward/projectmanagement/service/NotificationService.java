package com.skyward.projectmanagement.service;

import com.skyward.projectmanagement.entity.Notification;
import com.skyward.projectmanagement.model.Project;
import com.skyward.projectmanagement.repository.NotificationRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository
            notificationRepository;

    public NotificationService(
            NotificationRepository
                    notificationRepository
    ) {
        this.notificationRepository =
                notificationRepository;
    }

    public Notification createNotification(
            String title,
            String message,
            Notification.NotificationType type,
            String createdBy,
            Long referenceId,
            String referenceType,
            Project project
    ) {

        Notification notification =
                new Notification();

        notification.setTitle(
                title
        );

        notification.setMessage(
                message
        );

        notification.setType(
                type
        );

        notification.setCreatedBy(
                createdBy
        );

        notification.setReferenceId(
                referenceId
        );

        notification.setReferenceType(
                referenceType
        );

        notification.setProject(
                project
        );

        notification.setReadStatus(
                false
        );

        return notificationRepository
                .save(
                        notification
                );
    }

    public List<Notification>
    getAllNotifications() {

        return notificationRepository
                .findAllByOrderByCreatedAtDesc();
    }

    public List<Notification>
    getUnreadNotifications() {

        return notificationRepository
                .findByReadStatusFalseOrderByCreatedAtDesc();
    }

    public long getUnreadCount() {

        return notificationRepository
                .countByReadStatusFalse();
    }

    public Notification markAsRead(
            Long notificationId
    ) {

        Notification notification =
                notificationRepository
                        .findById(
                                notificationId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found."
                                )
                        );

        notification.setReadStatus(
                true
        );

        return notificationRepository
                .save(
                        notification
                );
    }

    public void markAllAsRead() {

        List<Notification>
                unreadNotifications =
                notificationRepository
                        .findByReadStatusFalseOrderByCreatedAtDesc();

        unreadNotifications
                .forEach(
                        notification ->
                                notification.setReadStatus(
                                        true
                                )
                );

        notificationRepository
                .saveAll(
                        unreadNotifications
                );
    }

    public List<Notification>
    getProjectNotifications(
            Long projectId
    ) {

        return notificationRepository
                .findByProjectIdOrderByCreatedAtDesc(
                        projectId
                );
    }
}