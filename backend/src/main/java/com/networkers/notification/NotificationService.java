package com.networkers.notification;

import com.networkers.user.User;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private final NotificationRepository notifications;
    private final WebPushService push;
    public NotificationService(NotificationRepository notifications, WebPushService push) { this.notifications = notifications; this.push = push; }
    public void notify(User user, String title, String message) {
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setMessage(message);
        notifications.save(n);
        push.send(user,title,message,"/notifications");
    }
}
