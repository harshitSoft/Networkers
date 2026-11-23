package com.networkers.groups;

import com.networkers.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="group_topic_comments",indexes={@Index(columnList="topic_id,active,createdAt"),@Index(columnList="member_id")})
public class GroupTopicComment {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private GroupTopic topic;
    @ManyToOne(optional=false) private Group group;
    @ManyToOne(optional=false) private User member;
    @Column(nullable=false,length=2000) private String comment;
    private boolean active=true; private LocalDateTime createdAt; private LocalDateTime updatedAt;
    @PrePersist void onCreate(){createdAt=LocalDateTime.now();updatedAt=createdAt;}
    @PreUpdate void onUpdate(){updatedAt=LocalDateTime.now();}
    public Long getId(){return id;} public GroupTopic getTopic(){return topic;} public void setTopic(GroupTopic v){topic=v;} public Group getGroup(){return group;} public void setGroup(Group v){group=v;}
    public User getMember(){return member;} public void setMember(User v){member=v;} public String getComment(){return comment;} public void setComment(String v){comment=v;}
    public boolean isActive(){return active;} public void setActive(boolean v){active=v;} public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
