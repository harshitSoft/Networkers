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
    private final PushSubscriptionRepository subscriptions;private final WebPushService push;
    public NotificationController(NotificationRepository notifications,PushSubscriptionRepository subscriptions,WebPushService push) { this.notifications = notifications;this.subscriptions=subscriptions;this.push=push; }
    @GetMapping("/push/public-key") public ApiResponse<?> publicKey(){java.util.Map<String,Object> result=new java.util.LinkedHashMap<>();result.put("publicKey",push.publicKey());result.put("configured",push.configured());return ApiResponse.ok("Push configuration",result);}
    @PostMapping("/push/subscriptions") public ApiResponse<?> subscribe(@RequestBody PushRequest request){if(request.endpoint()==null||request.endpoint().isBlank())throw new IllegalArgumentException("Push endpoint is required");PushSubscription item=subscriptions.findByEndpoint(request.endpoint()).orElseGet(PushSubscription::new);item.setUser(CurrentUser.get());item.setEndpoint(request.endpoint());item.setPublicKey(request.publicKey());item.setAuth(request.auth());subscriptions.save(item);return ApiResponse.ok("Push notifications enabled",true);}
    @DeleteMapping("/push/subscriptions") public ApiResponse<?> unsubscribe(@RequestBody java.util.Map<String,String> request){subscriptions.deleteByEndpoint(request.get("endpoint"));return ApiResponse.ok("Push notifications disabled",true);}
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
    public record PushRequest(String endpoint,String publicKey,String auth){}
}
