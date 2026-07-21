package com.networkers.event;
import com.networkers.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="event_rsvps",uniqueConstraints=@UniqueConstraint(columnNames={"event_id","user_id"}))
public class EventRsvp { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(optional=false) private Event event; @ManyToOne(optional=false) private User user; @Enumerated(EnumType.STRING) private EventRsvpStatus status; private LocalDateTime updatedAt; @PrePersist @PreUpdate void touch(){updatedAt=LocalDateTime.now();} public Long getId(){return id;} public Event getEvent(){return event;} public void setEvent(Event v){event=v;} public User getUser(){return user;} public void setUser(User v){user=v;} public EventRsvpStatus getStatus(){return status;} public void setStatus(EventRsvpStatus v){status=v;} public LocalDateTime getUpdatedAt(){return updatedAt;} }
