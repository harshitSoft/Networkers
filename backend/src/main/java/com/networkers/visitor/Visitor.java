package com.networkers.visitor;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name="visitors")
public class Visitor {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String fullName;
    @Column(nullable=false,length=20) private String mobile;
    private String email;
    private String businessName;
    private String city;
    private String purpose;
    private String personToMeet;
    @Column(nullable=false) private LocalDate visitDate;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal paymentAmount=BigDecimal.ZERO;
    private boolean paymentConfirmed;
    private LocalDateTime paymentConfirmedAt;
    @Column(length=1500) private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist void create(){createdAt=LocalDateTime.now();updatedAt=createdAt;}
    @PreUpdate void update(){updatedAt=LocalDateTime.now();}
    public Long getId(){return id;} public String getFullName(){return fullName;} public void setFullName(String v){fullName=v;} public String getMobile(){return mobile;} public void setMobile(String v){mobile=v;} public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getBusinessName(){return businessName;} public void setBusinessName(String v){businessName=v;} public String getCity(){return city;} public void setCity(String v){city=v;} public String getPurpose(){return purpose;} public void setPurpose(String v){purpose=v;} public String getPersonToMeet(){return personToMeet;} public void setPersonToMeet(String v){personToMeet=v;} public LocalDate getVisitDate(){return visitDate;} public void setVisitDate(LocalDate v){visitDate=v;} public BigDecimal getPaymentAmount(){return paymentAmount;} public void setPaymentAmount(BigDecimal v){paymentAmount=v;} public boolean isPaymentConfirmed(){return paymentConfirmed;} public void setPaymentConfirmed(boolean v){paymentConfirmed=v;paymentConfirmedAt=v?LocalDateTime.now():null;} public LocalDateTime getPaymentConfirmedAt(){return paymentConfirmedAt;} public String getNotes(){return notes;} public void setNotes(String v){notes=v;} public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
