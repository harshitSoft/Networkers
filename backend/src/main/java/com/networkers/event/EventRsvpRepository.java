package com.networkers.event;
import com.networkers.user.User; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface EventRsvpRepository extends JpaRepository<EventRsvp,Long>{ Optional<EventRsvp> findByEventAndUser(Event event,User user); List<EventRsvp> findByEventOrderByUserFullNameAsc(Event event); long countByUserAndStatus(User user,EventRsvpStatus status); void deleteByEvent(Event event); }
