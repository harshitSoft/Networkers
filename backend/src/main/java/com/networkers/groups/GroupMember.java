package com.networkers.groups;

import com.networkers.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="group_members",uniqueConstraints=@UniqueConstraint(columnNames={"group_id","member_id"}),indexes=@Index(columnList="member_id,joinedAt"))
public class GroupMember {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private Group group;
    @ManyToOne(optional=false) private User member;
    @Column(nullable=false,length=20) private String role="MEMBER";
    private LocalDateTime joinedAt;
    @PrePersist void onCreate(){joinedAt=LocalDateTime.now();}
    public Long getId(){return id;} public Group getGroup(){return group;} public void setGroup(Group v){group=v;}
    public User getMember(){return member;} public void setMember(User v){member=v;} public String getRole(){return role;} public void setRole(String v){role=v;} public LocalDateTime getJoinedAt(){return joinedAt;}
}
