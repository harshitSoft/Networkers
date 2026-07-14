package com.networkers.meetup;

import com.networkers.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class MeetupAttendee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) private Meetup meetup;
    @ManyToOne(optional = false) private User user;
    @Enumerated(EnumType.STRING) private AttendeeStatus status = AttendeeStatus.JOINED;
    private LocalDateTime joinedAt;
    @PrePersist void onCreate() { joinedAt = LocalDateTime.now(); }
    public Long getId() { return id; }
    public Meetup getMeetup() { return meetup; }
    public void setMeetup(Meetup meetup) { this.meetup = meetup; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public AttendeeStatus getStatus() { return status; }
    public void setStatus(AttendeeStatus status) { this.status = status; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
}
