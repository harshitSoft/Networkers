package com.networkers.meetingautomation;
import com.networkers.user.User; import jakarta.persistence.*;
@Entity @Table(name="monthly_meeting_participants",uniqueConstraints=@UniqueConstraint(columnNames={"group_id","member_id"}))
public class MeetingParticipant { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(optional=false) private MeetingGroup group; @ManyToOne(optional=false) private User member; public Long getId(){return id;} public MeetingGroup getGroup(){return group;} public void setGroup(MeetingGroup v){group=v;} public User getMember(){return member;} public void setMember(User v){member=v;} }
