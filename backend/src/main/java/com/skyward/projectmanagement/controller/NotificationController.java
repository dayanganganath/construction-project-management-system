package com.skyward.projectmanagement.controller;

import com.skyward.projectmanagement.entity.Notification;
import com.skyward.projectmanagement.service.NotificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService
            notificationService;

    public NotificationController(
            NotificationService
                    notificationService
    ) {
        this.notificationService =
                notificationService;
    }

    @GetMapping
    public ResponseEntity<
            List<Notification>
            >
    getAllNotifications() {

        return ResponseEntity.ok(
                notificationService
                        .getAllNotifications()
        );
    }

    @GetMapping("/unread")
    public ResponseEntity<
            List<Notification>
            >
    getUnreadNotifications() {

        return ResponseEntity.ok(
                notificationService
                        .getUnreadNotifications()
        );
    }

    @GetMapping("/unread-count")
    public ResponseEntity<
            Map<String, Long>
            >
    getUnreadCount() {

        return ResponseEntity.ok(
                Map.of(
                        "count",
                        notificationService
                                .getUnreadCount()
                )
        );
    }

    @GetMapping(
            "/project/{projectId}"
    )
    public ResponseEntity<
            List<Notification>
            >
    getProjectNotifications(
            @PathVariable
            Long projectId
    ) {

        return ResponseEntity.ok(
                notificationService
                        .getProjectNotifications(
                                projectId
                        )
        );
    }

    @PutMapping(
            "/{notificationId}/read"
    )
    public ResponseEntity<
            Notification
            >
    markAsRead(
            @PathVariable
            Long notificationId
    ) {

        return ResponseEntity.ok(
                notificationService
                        .markAsRead(
                                notificationId
                        )
        );
    }

    @PutMapping(
            "/read-all"
    )
    public ResponseEntity<?>
    markAllAsRead() {

        notificationService
                .markAllAsRead();

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "All notifications marked as read."
                )
        );
    }
}