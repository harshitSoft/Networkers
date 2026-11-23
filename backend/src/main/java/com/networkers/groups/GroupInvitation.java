package com.networkers.groups;

import com.networkers.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="group_invitations",indexes={@Index(columnList="invitedMember_id,status"),@Index(columnList="group_id,invitedMember_id,status")})
public class GroupInvitation {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private Group group;
    @ManyToOne(optional=false) private User invitedBy;
    @ManyToOne(optional=false) private User invitedMember;
    @Column(nullable=false,length=20) private String status="SENT";
    private LocalDateTime createdAt; private LocalDateTime respondedAt;
    @PrePersist void onCreate(){createdAt=LocalDateTime.now();}
    public Long getId(){return id;} public Group getGroup(){return group;} public void setGroup(Group v){group=v;}
    public User getInvitedBy(){return invitedBy;} public void setInvitedBy(User v){invitedBy=v;}
    public User getInvitedMember(){return invitedMember;} public void setInvitedMember(User v){invitedMember=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getRespondedAt(){return respondedAt;} public void setRespondedAt(LocalDateTime v){respondedAt=v;}
}
