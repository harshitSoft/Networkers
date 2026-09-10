package com.networkers.community;

import com.networkers.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(uniqueConstraints=@UniqueConstraint(columnNames={"post_id","reporter_id"}))
public class PostReport {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) private Post post;
 @ManyToOne(optional=false) @JoinColumn(name="reporter_id") private User reporter;
 @Column(length=500) private String reason;
 private LocalDateTime createdAt;
 @PrePersist void create(){createdAt=LocalDateTime.now();}
 public Long getId(){return id;} public Post getPost(){return post;} public void setPost(Post v){post=v;} public User getReporter(){return reporter;} public void setReporter(User v){reporter=v;} public String getReason(){return reason;} public void setReason(String v){reason=v;} public LocalDateTime getCreatedAt(){return createdAt;}
}
