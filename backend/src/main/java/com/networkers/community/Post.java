package com.networkers.community;

import com.networkers.user.User;
import com.networkers.meetingautomation.MonthlyMeeting;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) private User user;
    @Enumerated(EnumType.STRING) private PostType type = PostType.BUSINESS_UPDATE;
    private String title;
    @Column(length = 3000) private String content;
    @ManyToOne private MonthlyMeeting meeting;
    @Column(length = 1500) private String mediaUrl;
    private String mediaType;
    @ManyToMany
    @JoinTable(name = "post_mentions", joinColumns = @JoinColumn(name = "post_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private java.util.Set<User> mentions = new java.util.LinkedHashSet<>();
    @ManyToMany
    @JoinTable(name = "post_kudos", joinColumns = @JoinColumn(name = "post_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private java.util.Set<User> kudos = new java.util.LinkedHashSet<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public PostType getType() { return type; }
    public void setType(PostType type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public MonthlyMeeting getMeeting() { return meeting; }
    public void setMeeting(MonthlyMeeting meeting) { this.meeting = meeting; }
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }
    public java.util.Set<User> getMentions() { return mentions; }
    public java.util.Set<User> getKudos() { return kudos; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
