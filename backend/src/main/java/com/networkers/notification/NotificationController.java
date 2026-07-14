package com.networkers.notification;

import com.networkers.common.ApiResponse;
import com.networkers.security.CurrentUser;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationRepository notifications;
    public NotificationController(NotificationRepository notifications) { this.notifications = notifications; }
    @GetMapping public ApiResponse<List<Notification>> all() {
        return ApiResponse.ok("Notifications", notifications.findByUserOrderByCreatedAtDesc(CurrentUser.get()));
    }
    @PutMapping("/{id}/read") public ApiResponse<Notification> read(@PathVariable Long id) {
        Notification n = notifications.findById(id).orElseThrow(() -> new EntityNotFoundException("Notification not found"));
        if (!n.getUser().getId().equals(CurrentUser.get().getId())) throw new IllegalStateException("Not allowed");
        n.setRead(true);
        return ApiResponse.ok("Notification read", notifications.save(n));
    }
    @PutMapping("/read-all") public ApiResponse<List<Notification>> readAll() {
        var list = notifications.findByUserOrderByCreatedAtDesc(CurrentUser.get());
        list.forEach(n -> n.setRead(true));
        return ApiResponse.ok("Notifications read", notifications.saveAll(list));
    }
}
