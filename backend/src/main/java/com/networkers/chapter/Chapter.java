package com.networkers.chapter;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
public class Chapter {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true) private Integer chapterNumber;
    private String chapterName;
    @Column(length = 2000) private String description;
    private String location;
    private String subscriptionName;
    private BigDecimal subscriptionAmount;
    private Integer subscriptionDurationMonths;
    private boolean active = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public Integer getChapterNumber() { return chapterNumber; }
    public void setChapterNumber(Integer chapterNumber) { this.chapterNumber = chapterNumber; }
    public String getChapterName() { return chapterName; }
    public void setChapterName(String chapterName) { this.chapterName = chapterName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getSubscriptionName() { return subscriptionName; }
    public void setSubscriptionName(String subscriptionName) { this.subscriptionName = subscriptionName; }
    public BigDecimal getSubscriptionAmount() { return subscriptionAmount; }
    public void setSubscriptionAmount(BigDecimal subscriptionAmount) { this.subscriptionAmount = subscriptionAmount; }
    public Integer getSubscriptionDurationMonths() { return subscriptionDurationMonths; }
    public void setSubscriptionDurationMonths(Integer subscriptionDurationMonths) { this.subscriptionDurationMonths = subscriptionDurationMonths; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
