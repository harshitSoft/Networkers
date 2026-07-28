package com.networkers.meetingautomation;

import com.networkers.user.User;
import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "monthly_pair_meetings", uniqueConstraints = @UniqueConstraint(columnNames = {"meeting_id", "member_one_id", "member_two_id"}))
public class PairMeeting {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) private MonthlyMeeting meeting;
    @ManyToOne(optional = false) @JoinColumn(name = "member_one_id") private User memberOne;
    @ManyToOne(optional = false) @JoinColumn(name = "member_two_id") private User memberTwo;
    private LocalDate metOn;
    @Column(length = 1000) private String notes;
    private String photoUrl;
    @ManyToOne private User completedBy;
    private LocalDateTime completedAt;

    public Long getId(){return id;}
    public MonthlyMeeting getMeeting(){return meeting;} public void setMeeting(MonthlyMeeting v){meeting=v;}
    public User getMemberOne(){return memberOne;} public void setMemberOne(User v){memberOne=v;}
    public User getMemberTwo(){return memberTwo;} public void setMemberTwo(User v){memberTwo=v;}
    public LocalDate getMetOn(){return metOn;} public void setMetOn(LocalDate v){metOn=v;}
    public String getNotes(){return notes;} public void setNotes(String v){notes=v;}
    public String getPhotoUrl(){return photoUrl;} public void setPhotoUrl(String v){photoUrl=v;}
    public User getCompletedBy(){return completedBy;} public void setCompletedBy(User v){completedBy=v;}
    public LocalDateTime getCompletedAt(){return completedAt;} public void setCompletedAt(LocalDateTime v){completedAt=v;}
    public boolean isCompleted(){return metOn!=null&&photoUrl!=null&&!photoUrl.isBlank();}
}
