package com.networkers.notification;
import com.networkers.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(uniqueConstraints=@UniqueConstraint(columnNames="endpoint")) public class PushSubscription{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY)private Long id;@ManyToOne(optional=false)private User user;@Column(length=2000,nullable=false)private String endpoint;@Column(length=500,nullable=false)private String publicKey;@Column(length=500,nullable=false)private String auth;private LocalDateTime createdAt;
 @PrePersist void create(){createdAt=LocalDateTime.now();}public Long getId(){return id;}public User getUser(){return user;}public void setUser(User v){user=v;}public String getEndpoint(){return endpoint;}public void setEndpoint(String v){endpoint=v;}public String getPublicKey(){return publicKey;}public void setPublicKey(String v){publicKey=v;}public String getAuth(){return auth;}public void setAuth(String v){auth=v;}
}
