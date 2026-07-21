package com.networkers.auth;

import com.networkers.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class PasswordOtp {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) private User user;
    @Enumerated(EnumType.STRING) private PasswordOtpPurpose purpose;
    @Column(nullable = false) private String codeHash;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private int failedAttempts;
    private boolean used;

    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public PasswordOtpPurpose getPurpose() { return purpose; }
    public void setPurpose(PasswordOtpPurpose purpose) { this.purpose = purpose; }
    public String getCodeHash() { return codeHash; }
    public void setCodeHash(String codeHash) { this.codeHash = codeHash; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public int getFailedAttempts() { return failedAttempts; }
    public void setFailedAttempts(int failedAttempts) { this.failedAttempts = failedAttempts; }
    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }
}
