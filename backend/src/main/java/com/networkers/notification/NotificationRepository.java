package com.networkers.notification;

import com.networkers.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    Page<Notification> findByUser(User user, Pageable pageable);
    List<Notification> findTop20ByUserAndReadFalseOrderByCreatedAtDesc(User user);
    @Modifying
    @Query("update Notification n set n.read=true where n.user=:user and n.read=false")
    int markAllRead(User user);
}
