package com.networkers.joinrequest;

import jakarta.persistence.*;
import com.networkers.chapter.Chapter;
import java.time.LocalDateTime;

@Entity
@Table(name = "join_requests")
public class JoinRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String fullName;
    @Column(nullable = false) private String email;
    private String mobile;
    private String businessName;
    private String businessCategory;
    private String location;
    // Kept nullable at the schema level for legacy requests; all new requests require a chapter.
    @ManyToOne private Chapter chapter;
    @Column(length = 1500) private String message;
    @Enumerated(EnumType.STRING) private JoinRequestStatus status = JoinRequestStatus.PENDING;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist void create(){createdAt=LocalDateTime.now();updatedAt=createdAt;}
    @PreUpdate void update(){updatedAt=LocalDateTime.now();}
    public Long getId(){return id;} public String getFullName(){return fullName;} public void setFullName(String v){fullName=v;}
    public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getMobile(){return mobile;} public void setMobile(String v){mobile=v;}
    public String getBusinessName(){return businessName;} public void setBusinessName(String v){businessName=v;} public String getBusinessCategory(){return businessCategory;} public void setBusinessCategory(String v){businessCategory=v;}
    public String getLocation(){return location;} public void setLocation(String v){location=v;} public String getMessage(){return message;} public void setMessage(String v){message=v;}
    public Chapter getChapter(){return chapter;} public void setChapter(Chapter v){chapter=v;}
    public JoinRequestStatus getStatus(){return status;} public void setStatus(JoinRequestStatus v){status=v;} public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
