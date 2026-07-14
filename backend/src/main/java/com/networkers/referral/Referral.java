package com.networkers.referral;

import com.networkers.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
public class Referral {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) private User givenBy;
    @ManyToOne(optional = false) private User receivedBy;
    @ManyToOne private OpenReferralPost openReferralPost;
    @Enumerated(EnumType.STRING) private ReferralType referralType = ReferralType.DIRECT;
    private String workName;
    private String companyName;
    private String productOrServiceRequired;
    private String location;
    private String posterUrl;
    private String clientName;
    private String clientCompany;
    private String clientPhone;
    private String clientEmail;
    private String workTitle;
    private String workCategory;
    @Column(length = 2000) private String requirement;
    @Column(length = 2000) private String description;
    private BigDecimal estimatedBudget;
    private BigDecimal estimatedPrice;
    @Enumerated(EnumType.STRING) private ReferralPriority priority = ReferralPriority.MEDIUM;
    @Enumerated(EnumType.STRING) private ReferralStatus status = ReferralStatus.NEW;
    private BigDecimal businessValue;
    private BigDecimal confirmedAmount;
    @Column(length = 2000) private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
    public Long getId() { return id; }
    public User getGivenBy() { return givenBy; }
    public void setGivenBy(User givenBy) { this.givenBy = givenBy; }
    public User getReceivedBy() { return receivedBy; }
    public void setReceivedBy(User receivedBy) { this.receivedBy = receivedBy; }
    public OpenReferralPost getOpenReferralPost() { return openReferralPost; }
    public void setOpenReferralPost(OpenReferralPost openReferralPost) { this.openReferralPost = openReferralPost; }
    public ReferralType getReferralType() { return referralType; }
    public void setReferralType(ReferralType referralType) { this.referralType = referralType; }
    public String getWorkName() { return workName; }
    public void setWorkName(String workName) { this.workName = workName; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getProductOrServiceRequired() { return productOrServiceRequired; }
    public void setProductOrServiceRequired(String productOrServiceRequired) { this.productOrServiceRequired = productOrServiceRequired; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public String getClientCompany() { return clientCompany; }
    public void setClientCompany(String clientCompany) { this.clientCompany = clientCompany; }
    public String getClientPhone() { return clientPhone; }
    public void setClientPhone(String clientPhone) { this.clientPhone = clientPhone; }
    public String getClientEmail() { return clientEmail; }
    public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }
    public String getWorkTitle() { return workTitle; }
    public void setWorkTitle(String workTitle) { this.workTitle = workTitle; }
    public String getWorkCategory() { return workCategory; }
    public void setWorkCategory(String workCategory) { this.workCategory = workCategory; }
    public String getRequirement() { return requirement; }
    public void setRequirement(String requirement) { this.requirement = requirement; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getEstimatedBudget() { return estimatedBudget; }
    public void setEstimatedBudget(BigDecimal estimatedBudget) { this.estimatedBudget = estimatedBudget; }
    public BigDecimal getEstimatedPrice() { return estimatedPrice; }
    public void setEstimatedPrice(BigDecimal estimatedPrice) { this.estimatedPrice = estimatedPrice; }
    public ReferralPriority getPriority() { return priority; }
    public void setPriority(ReferralPriority priority) { this.priority = priority; }
    public ReferralStatus getStatus() { return status; }
    public void setStatus(ReferralStatus status) { this.status = status; }
    public BigDecimal getBusinessValue() { return businessValue; }
    public void setBusinessValue(BigDecimal businessValue) { this.businessValue = businessValue; }
    public BigDecimal getConfirmedAmount() { return confirmedAmount; }
    public void setConfirmedAmount(BigDecimal confirmedAmount) { this.confirmedAmount = confirmedAmount; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
