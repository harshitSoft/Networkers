package com.networkers.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.networkers.chapter.Chapter;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fullName;
    @Column(unique = true, nullable = false)
    private String email;
    private String mobile;
    @Column(columnDefinition = "TEXT")
    private String profileImage;
    @JsonIgnore
    @Column(nullable = false)
    private String password;
    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;
    private boolean enabled = true;
    private boolean deleted = false;
    @ManyToOne
    private Chapter chapter;
    private String businessName;
    private String businessCategory;
    @Column(length = 1500)
    private String services;
    private String location;
    private String subscriptionPlan;
    private BigDecimal subscriptionAmount;
    private LocalDate subscriptionStartDate;
    private LocalDate subscriptionEndDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
    public Chapter getChapter() { return chapter; }
    public void setChapter(Chapter chapter) { this.chapter = chapter; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getBusinessCategory() { return businessCategory; }
    public void setBusinessCategory(String businessCategory) { this.businessCategory = businessCategory; }
    public String getServices() { return services; }
    public void setServices(String services) { this.services = services; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getSubscriptionPlan() { return subscriptionPlan; }
    public void setSubscriptionPlan(String subscriptionPlan) { this.subscriptionPlan = subscriptionPlan; }
    public BigDecimal getSubscriptionAmount() { return subscriptionAmount; }
    public void setSubscriptionAmount(BigDecimal subscriptionAmount) { this.subscriptionAmount = subscriptionAmount; }
    public LocalDate getSubscriptionStartDate() { return subscriptionStartDate; }
    public void setSubscriptionStartDate(LocalDate subscriptionStartDate) { this.subscriptionStartDate = subscriptionStartDate; }
    public LocalDate getSubscriptionEndDate() { return subscriptionEndDate; }
    public void setSubscriptionEndDate(LocalDate subscriptionEndDate) { this.subscriptionEndDate = subscriptionEndDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
