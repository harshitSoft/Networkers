package com.networkers.groups;

import com.networkers.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="group_topics",indexes={@Index(columnList="group_id,active,createdAt"),@Index(columnList="creator_id")})
public class GroupTopic {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private Group group;
    @ManyToOne(optional=false) private User creator;
    @Column(nullable=false,length=160) private String title;
    @Column(nullable=false,length=10000) private String description;
    @Column(length=1500) private String attachmentUrl;
    private boolean active=true; private LocalDateTime createdAt; private LocalDateTime updatedAt;
    @PrePersist void onCreate(){createdAt=LocalDateTime.now();updatedAt=createdAt;}
    @PreUpdate void onUpdate(){updatedAt=LocalDateTime.now();}
    public Long getId(){return id;} public Group getGroup(){return group;} public void setGroup(Group v){group=v;}
    public User getCreator(){return creator;} public void setCreator(User v){creator=v;} public String getTitle(){return title;} public void setTitle(String v){title=v;}
    public String getDescription(){return description;} public void setDescription(String v){description=v;} public String getAttachmentUrl(){return attachmentUrl;} public void setAttachmentUrl(String v){attachmentUrl=v;}
    public boolean isActive(){return active;} public void setActive(boolean v){active=v;} public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
