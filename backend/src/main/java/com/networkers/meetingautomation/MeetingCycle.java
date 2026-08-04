package com.networkers.meetingautomation;

import com.networkers.chapter.Chapter;
import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name="meeting_cycles",uniqueConstraints=@UniqueConstraint(columnNames={"chapter_id","cycle_number"}))
public class MeetingCycle {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) private Chapter chapter;
    @Column(name="cycle_number",nullable=false) private int cycleNumber;
    @Column(nullable=false) private LocalDate startDate;
    private LocalDate completedDate;
    private LocalDate nextCycleDate;
    @Enumerated(EnumType.STRING) private MeetingCycleStatus status=MeetingCycleStatus.ACTIVE;
    private LocalDateTime createdAt;
    @PrePersist void create(){createdAt=LocalDateTime.now();}
    public Long getId(){return id;} public Chapter getChapter(){return chapter;} public void setChapter(Chapter v){chapter=v;}
    public int getCycleNumber(){return cycleNumber;} public void setCycleNumber(int v){cycleNumber=v;}
    public LocalDate getStartDate(){return startDate;} public void setStartDate(LocalDate v){startDate=v;}
    public LocalDate getCompletedDate(){return completedDate;} public void setCompletedDate(LocalDate v){completedDate=v;}
    public LocalDate getNextCycleDate(){return nextCycleDate;} public void setNextCycleDate(LocalDate v){nextCycleDate=v;}
    public MeetingCycleStatus getStatus(){return status;} public void setStatus(MeetingCycleStatus v){status=v;}
    public LocalDateTime getCreatedAt(){return createdAt;}
}
