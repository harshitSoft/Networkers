package com.networkers.referral;

import com.networkers.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
public class ReferralRevenue {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(optional = false) private Referral referral;
    @ManyToOne(optional = false) private User giver;
    @ManyToOne(optional = false) private User receiver;
    private BigDecimal amount;
    private Integer month;
    private Integer year;
    private LocalDateTime createdAt;

    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public Referral getReferral() { return referral; }
    public void setReferral(Referral referral) { this.referral = referral; }
    public User getGiver() { return giver; }
    public void setGiver(User giver) { this.giver = giver; }
    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
