package com.networkers.tyfcb;

import com.networkers.referral.Referral;
import com.networkers.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tyfcbs", uniqueConstraints = @UniqueConstraint(name = "uk_tyfcb_referral", columnNames = "referral_id"))
public class Tyfcb {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true, length = 32) private String referenceNumber;
    @ManyToOne(optional = false, fetch = FetchType.LAZY) private User thankYouTo;
    @ManyToOne(optional = false, fetch = FetchType.LAZY) private User receivedBy;
    @ManyToOne(fetch = FetchType.LAZY) private Referral referral;
    @Column(nullable = false, precision = 19, scale = 2) private BigDecimal businessAmount;
    @Column(nullable = false, length = 30) private String businessType;
    @Column(nullable = false, length = 30) private String referralType;
    @Column(length = 2000) private String businessDescription;
    @Column(nullable = false) private LocalDate businessDate;
    @Column(length = 2000) private String comments;
    @Column(nullable = false) private LocalDateTime submittedAt;

    @PrePersist void onCreate() { submittedAt = LocalDateTime.now(); }
    public Long getId() { return id; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String v) { referenceNumber=v; }
    public User getThankYouTo() { return thankYouTo; }
    public void setThankYouTo(User v) { thankYouTo=v; }
    public User getReceivedBy() { return receivedBy; }
    public void setReceivedBy(User v) { receivedBy=v; }
    public Referral getReferral() { return referral; }
    public void setReferral(Referral v) { referral=v; }
    public BigDecimal getBusinessAmount() { return businessAmount; }
    public void setBusinessAmount(BigDecimal v) { businessAmount=v; }
    public String getBusinessType() { return businessType; }
    public void setBusinessType(String v) { businessType=v; }
    public String getReferralType() { return referralType; }
    public void setReferralType(String v) { referralType=v; }
    public String getBusinessDescription() { return businessDescription; }
    public void setBusinessDescription(String v) { businessDescription=v; }
    public LocalDate getBusinessDate() { return businessDate; }
    public void setBusinessDate(LocalDate v) { businessDate=v; }
    public String getComments() { return comments; }
    public void setComments(String v) { comments=v; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
}
