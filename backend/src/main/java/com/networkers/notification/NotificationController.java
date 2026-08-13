package com.networkers.notification;

import com.networkers.common.ApiResponse;
import com.networkers.security.CurrentUser;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.networkers.common.PageResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationRepository notifications;
    public NotificationController(NotificationRepository notifications) { this.notifications = notifications; }
    @GetMapping public ApiResponse<PageResponse<Notification>> all(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size) {
        var result=notifications.findByUser(CurrentUser.get(),PageRequest.of(Math.max(0,page),Math.min(100,Math.max(1,size)),Sort.by(Sort.Direction.DESC,"createdAt")));
        return ApiResponse.ok("Notifications",new PageResponse<>(result.getContent(),result.getNumber(),result.getSize(),result.getTotalElements(),result.getTotalPages()));
    }
    @GetMapping("/unread-summary") public ApiResponse<List<Notification>> unreadSummary(){return ApiResponse.ok("Unread notifications",notifications.findTop20ByUserAndReadFalseOrderByCreatedAtDesc(CurrentUser.get()));}
    @PutMapping("/{id}/read") public ApiResponse<Notification> read(@PathVariable Long id) {
        Notification n = notifications.findById(id).orElseThrow(() -> new EntityNotFoundException("Notification not found"));
        if (!n.getUser().getId().equals(CurrentUser.get().getId())) throw new IllegalStateException("Not allowed");
        n.setRead(true);
        return ApiResponse.ok("Notification read", notifications.save(n));
    }
    @PutMapping("/read-all") @Transactional public ApiResponse<Integer> readAll() {
        return ApiResponse.ok("Notifications read", notifications.markAllRead(CurrentUser.get()));
    }
}
