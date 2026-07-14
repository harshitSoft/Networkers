package com.networkers.connection;

import com.networkers.common.ApiResponse;
import com.networkers.notification.NotificationService;
import com.networkers.security.CurrentUser;
import com.networkers.user.User;
import com.networkers.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {
    private final ConnectionRepository connections;
    private final UserRepository users;
    private final NotificationService notificationService;
    public ConnectionController(ConnectionRepository connections, UserRepository users, NotificationService notificationService) {
        this.connections = connections; this.users = users; this.notificationService = notificationService;
    }
    @PostMapping("/send/{receiverId}") public ApiResponse<Connection> send(@PathVariable Long receiverId) {
        User sender = CurrentUser.get();
        User receiver = users.findById(receiverId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (sender.getId().equals(receiver.getId())) throw new IllegalArgumentException("Cannot connect with yourself");
        if (connections.existsBySenderAndReceiver(sender, receiver) || connections.existsBySenderAndReceiver(receiver, sender)) {
            throw new IllegalStateException("Connection request already exists");
        }
        Connection c = new Connection(); c.setSender(sender); c.setReceiver(receiver);
        notificationService.notify(receiver, "Connection request", sender.getFullName() + " wants to connect with you.");
        return ApiResponse.ok("Connection request sent", connections.save(c));
    }
    @PutMapping("/accept/{connectionId}") public ApiResponse<Connection> accept(@PathVariable Long connectionId) { return change(connectionId, ConnectionStatus.ACCEPTED); }
    @PutMapping("/reject/{connectionId}") public ApiResponse<Connection> reject(@PathVariable Long connectionId) { return change(connectionId, ConnectionStatus.REJECTED); }
    @GetMapping("/received") public ApiResponse<List<Connection>> received() { return ApiResponse.ok("Received requests", connections.findByReceiverOrderByCreatedAtDesc(CurrentUser.get())); }
    @GetMapping("/sent") public ApiResponse<List<Connection>> sent() { return ApiResponse.ok("Sent requests", connections.findBySenderOrderByCreatedAtDesc(CurrentUser.get())); }
    @GetMapping("/my-network") public ApiResponse<List<Connection>> network() { return ApiResponse.ok("My network", connections.network(CurrentUser.get())); }
    @DeleteMapping("/{connectionId}") public ApiResponse<Void> remove(@PathVariable Long connectionId) {
        Connection c = connections.findById(connectionId).orElseThrow(() -> new EntityNotFoundException("Connection not found"));
        Long uid = CurrentUser.get().getId();
        if (!c.getSender().getId().equals(uid) && !c.getReceiver().getId().equals(uid)) throw new IllegalStateException("Not allowed");
        connections.delete(c);
        return ApiResponse.ok("Connection removed", null);
    }
    @DeleteMapping("/cancel/{connectionId}") public ApiResponse<Void> cancel(@PathVariable Long connectionId) {
        Connection c = connections.findById(connectionId).orElseThrow(() -> new EntityNotFoundException("Connection not found"));
        if (!c.getSender().getId().equals(CurrentUser.get().getId())) throw new IllegalStateException("Only sender can cancel request");
        if (c.getStatus() != ConnectionStatus.PENDING) throw new IllegalStateException("Only pending requests can be cancelled");
        connections.delete(c);
        return ApiResponse.ok("Connection request cancelled", null);
    }
    private ApiResponse<Connection> change(Long id, ConnectionStatus status) {
        Connection c = connections.findById(id).orElseThrow(() -> new EntityNotFoundException("Connection not found"));
        if (!c.getReceiver().getId().equals(CurrentUser.get().getId())) throw new IllegalStateException("Only receiver can update request");
        c.setStatus(status);
        if (status == ConnectionStatus.ACCEPTED) notificationService.notify(c.getSender(), "Connection accepted", c.getReceiver().getFullName() + " accepted your connection.");
        return ApiResponse.ok("Connection updated", connections.save(c));
    }
}
