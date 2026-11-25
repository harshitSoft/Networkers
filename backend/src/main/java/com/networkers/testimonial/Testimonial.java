package com.networkers.testimonial;

import com.networkers.user.User;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="testimonials", indexes={@Index(name="idx_testimonial_recipient",columnList="recipient_id, status, submitted_at"),@Index(name="idx_testimonial_sender",columnList="sender_id, submitted_at")})
public class Testimonial {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, unique=true, length=40) private String referenceNumber;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private User sender;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private User recipient;
    @Column(nullable=false, length=1000) private String description;
    @Column(nullable=false) private LocalDate experienceDate;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private TestimonialStatus status=TestimonialStatus.PENDING;
    @Column(nullable=false) private boolean visible=true;
    @Column(length=1000) private String moderationNote;
    private LocalDateTime moderatedAt;
    @ManyToOne(fetch=FetchType.LAZY) private User moderatedBy;
    @Column(nullable=false) private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
    @PrePersist void create(){submittedAt=LocalDateTime.now();updatedAt=submittedAt;}
    @PreUpdate void update(){updatedAt=LocalDateTime.now();}
    public Long getId(){return id;} public String getReferenceNumber(){return referenceNumber;} public void setReferenceNumber(String v){referenceNumber=v;}
    public User getSender(){return sender;} public void setSender(User v){sender=v;} public User getRecipient(){return recipient;} public void setRecipient(User v){recipient=v;}
    public String getDescription(){return description;} public void setDescription(String v){description=v;}
    public LocalDate getExperienceDate(){return experienceDate;} public void setExperienceDate(LocalDate v){experienceDate=v;} public TestimonialStatus getStatus(){return status;} public void setStatus(TestimonialStatus v){status=v;}
    public boolean isVisible(){return visible;} public void setVisible(boolean v){visible=v;} public String getModerationNote(){return moderationNote;} public void setModerationNote(String v){moderationNote=v;}
    public LocalDateTime getModeratedAt(){return moderatedAt;} public void setModeratedAt(LocalDateTime v){moderatedAt=v;} public User getModeratedBy(){return moderatedBy;} public void setModeratedBy(User v){moderatedBy=v;}
    public LocalDateTime getSubmittedAt(){return submittedAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
