package com.networkers.notification;
import com.networkers.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription,Long>{List<PushSubscription> findByUser(User user);Optional<PushSubscription> findByEndpoint(String endpoint);void deleteByEndpoint(String endpoint);}
