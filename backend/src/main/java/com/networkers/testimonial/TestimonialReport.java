package com.networkers.testimonial;

import com.networkers.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name="testimonial_reports", uniqueConstraints=@UniqueConstraint(name="uk_testimonial_reporter",columnNames={"testimonial_id","reporter_id"}))
public class TestimonialReport {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private Testimonial testimonial;
    @ManyToOne(optional=false) private User reporter;
    @Column(nullable=false,length=1000) private String reason;
    @Column(nullable=false) private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    @ManyToOne(fetch=FetchType.LAZY) private User reviewedBy;
    private boolean resolved;
    @PrePersist void create(){createdAt=LocalDateTime.now();}
    public Long getId(){return id;} public Testimonial getTestimonial(){return testimonial;} public void setTestimonial(Testimonial v){testimonial=v;}
    public User getReporter(){return reporter;} public void setReporter(User v){reporter=v;} public String getReason(){return reason;} public void setReason(String v){reason=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getReviewedAt(){return reviewedAt;} public void setReviewedAt(LocalDateTime v){reviewedAt=v;}
    public User getReviewedBy(){return reviewedBy;} public void setReviewedBy(User v){reviewedBy=v;} public boolean isResolved(){return resolved;} public void setResolved(boolean v){resolved=v;}
}
