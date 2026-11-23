package com.networkers.groups;

import com.networkers.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="network_groups", indexes={@Index(columnList="active,createdAt"),@Index(columnList="name")})
public class Group {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,length=100) private String name;
    @Column(nullable=false,length=3000) private String description;
    @ManyToOne(optional=false) private GroupCategory category;
    @ManyToOne(optional=false) private User creator;
    @Column(length=1500) private String coverImage;
    @Column(nullable=false,length=10) private String accessType="OPEN";
    private boolean active=true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist void onCreate(){createdAt=LocalDateTime.now();updatedAt=createdAt;}
    @PreUpdate void onUpdate(){updatedAt=LocalDateTime.now();}
    public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;}
    public String getDescription(){return description;} public void setDescription(String v){description=v;}
    public GroupCategory getCategory(){return category;} public void setCategory(GroupCategory v){category=v;}
    public User getCreator(){return creator;} public void setCreator(User v){creator=v;}
    public String getCoverImage(){return coverImage;} public void setCoverImage(String v){coverImage=v;}
    public String getAccessType(){return accessType;} public void setAccessType(String v){accessType=v;}
    public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
