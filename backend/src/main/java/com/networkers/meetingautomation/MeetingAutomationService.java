package com.networkers.meetingautomation;

import com.networkers.chapter.*;
import com.networkers.community.PostRepository;
import com.networkers.media.CloudinaryImageService;
import com.networkers.notification.NotificationService;
import com.networkers.user.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class MeetingAutomationService {
    private static final int MIN_GROUP_SIZE=5, MAX_GROUP_SIZE=10, MAX_WINDOW_DAYS=10;
    private static final LocalTime DEFAULT_TIME=LocalTime.of(19,0);
    private final ChapterRepository chapters; private final UserRepository users; private final MeetingGroupRepository groups;
    private final MeetingParticipantRepository participants; private final MonthlyMeetingRepository meetings;
    private final MeetingCommentRepository comments; private final PairMeetingRepository pairs; private final PostRepository posts;
    private final NotificationService notifications; private final CloudinaryImageService media;

    public MeetingAutomationService(ChapterRepository c,UserRepository u,MeetingGroupRepository g,MeetingParticipantRepository p,
      MonthlyMeetingRepository m,MeetingCommentRepository x,PairMeetingRepository pairs,PostRepository posts,
      NotificationService n,CloudinaryImageService media){
        chapters=c;users=u;groups=g;participants=p;meetings=m;comments=x;this.pairs=pairs;this.posts=posts;notifications=n;this.media=media;
    }

    @Scheduled(cron="0 0 1 1 * *",zone="Asia/Kolkata") @Transactional
    public void monthly(){YearMonth ym=YearMonth.now(ZoneId.of("Asia/Kolkata"));for(Chapter c:chapters.findByActiveTrueOrderByChapterNumberAsc())if(!groups.existsByChapterIdAndYearAndMonth(c.getId(),ym.getYear(),ym.getMonthValue()))generate(c,ym);}

    @Scheduled(cron="0 0 9 * * *",zone="Asia/Kolkata") @Transactional
    public void reminders(){
        LocalDate tomorrow=LocalDate.now(ZoneId.of("Asia/Kolkata")).plusDays(1);
        for(MonthlyMeeting m:meetings.findByScheduledDateAndReminderSentFalse(tomorrow)){
            for(MeetingParticipant p:participants.findByGroupIdOrderByMemberFullNameAsc(m.getGroup().getId()))
                notifications.notify(p.getMember(),"Individual meeting window starts tomorrow","Your Group "+m.getGroup().getGroupNumber()+" one-to-one meeting window runs from "+m.getScheduledDate()+" to "+effectiveEnd(m)+".");
            m.setReminderSent(true);meetings.save(m);
        }
    }

    @Transactional
    public List<MeetingView> regenerate(Long chapterId,YearMonth ym){
        Chapter c=chapters.findById(chapterId).orElseThrow(()->new EntityNotFoundException("Chapter not found"));
        List<MeetingGroup> old=groups.findByChapterIdAndYearAndMonthOrderByGroupNumber(chapterId,ym.getYear(),ym.getMonthValue());
        for(MeetingGroup g:old){posts.unlinkMeetingGroup(g.getId());comments.deleteByMeetingGroupId(g.getId());pairs.deleteByMeetingGroupId(g.getId());meetings.deleteByGroupId(g.getId());participants.deleteByGroupId(g.getId());}
        groups.deletePeriod(chapterId,ym.getYear(),ym.getMonthValue());groups.flush();generate(c,ym);return overview(chapterId,ym);
    }

    private void generate(Chapter chapter,YearMonth ym){
        LocalDate today=LocalDate.now(ZoneId.of("Asia/Kolkata"));
        if(ym.isBefore(YearMonth.from(today)))throw new IllegalArgumentException("Meetings cannot be generated for a past month");
        LocalDate firstAvailable=ym.equals(YearMonth.from(today))?today.plusDays(1):ym.atDay(1);
        if(firstAvailable.isAfter(ym.atEndOfMonth()))throw new IllegalArgumentException("No future date is available in "+ym+". Select a future month.");
        List<User> members=new ArrayList<>(users.findByChapterAndEnabledTrueAndDeletedFalseOrderByFullNameAsc(chapter));
        if(members.isEmpty())return;
        if(members.size()<MIN_GROUP_SIZE)throw new IllegalArgumentException("At least 5 active chapter members are required to create monthly groups");
        Collections.shuffle(members);
        int count=(int)Math.ceil((double)members.size()/MAX_GROUP_SIZE);
        while(count>1&&members.size()/count<MIN_GROUP_SIZE)count--;
        List<List<User>> buckets=new ArrayList<>();for(int i=0;i<count;i++)buckets.add(new ArrayList<>());
        for(int i=0;i<members.size();i++)buckets.get(i%count).add(members.get(i));
        Random random=new Random();
        for(int i=0;i<buckets.size();i++){
            List<User> bucket=buckets.get(i);User host=bucket.get(random.nextInt(bucket.size()));
            LocalDate suggestedStart=firstAvailable.plusDays(Math.min(i*MAX_WINDOW_DAYS,Math.max(0,ChronoUnit.DAYS.between(firstAvailable,ym.atEndOfMonth()))));
            LocalDate suggestedEnd=suggestedStart.plusDays(MAX_WINDOW_DAYS-1);if(suggestedEnd.isAfter(ym.atEndOfMonth()))suggestedEnd=ym.atEndOfMonth();
            MeetingGroup g=new MeetingGroup();g.setChapter(chapter);g.setYear(ym.getYear());g.setMonth(ym.getMonthValue());g.setGroupNumber(i+1);g.setHost(host);g=groups.save(g);
            for(User u:bucket){MeetingParticipant p=new MeetingParticipant();p.setGroup(g);p.setMember(u);participants.save(p);}
            MonthlyMeeting m=new MonthlyMeeting();m.setGroup(g);m.setScheduledDate(suggestedStart);m.setEndDate(suggestedEnd);m.setScheduledTime(DEFAULT_TIME);m=meetings.save(m);
            for(int a=0;a<bucket.size();a++)for(int b=a+1;b<bucket.size();b++){PairMeeting pair=new PairMeeting();pair.setMeeting(m);pair.setMemberOne(bucket.get(a));pair.setMemberTwo(bucket.get(b));pairs.save(pair);}
            for(User u:bucket)notifications.notify(u,"New monthly one-to-one group","Group "+(i+1)+" has "+bucket.size()+" members. "+host.getFullName()+" is the host and will confirm the meeting window.");
        }
    }

    @Transactional public MeetingView mine(User user,YearMonth ym){MeetingParticipant p=participants.findByGroupYearAndGroupMonthAndMember(ym.getYear(),ym.getMonthValue(),user).orElseThrow(()->new EntityNotFoundException("No monthly meeting assigned"));MonthlyMeeting m=meetings.findByGroupId(p.getGroup().getId()).orElseThrow();ensurePairs(m);return view(m,user);}
    @Transactional public List<MeetingView> overview(Long chapterId,YearMonth ym){List<MonthlyMeeting> result=meetings.findByGroupChapterIdAndGroupYearAndGroupMonthOrderByGroupGroupNumber(chapterId,ym.getYear(),ym.getMonthValue());result.forEach(this::ensurePairs);return result.stream().map(m->view(m,null)).toList();}

    @Transactional
    public MeetingView edit(Long id,User actor,UpdateRequest r,boolean admin){
        MonthlyMeeting m=find(id);if(!admin&&!m.getGroup().getHost().getId().equals(actor.getId()))throw new SecurityException("Only the assigned host can edit this meeting");
        boolean detailsChange=r.date()!=null||r.endDate()!=null||r.time()!=null||r.venue()!=null;
        if(!admin&&detailsChange&&m.getEditCount()>=m.getMaxEdits())throw new SecurityException("Meeting edit limit reached");
        LocalDate start=r.date()!=null?r.date():m.getScheduledDate(), end=r.endDate()!=null?r.endDate():effectiveEnd(m);
        YearMonth assigned=YearMonth.of(m.getGroup().getYear(),m.getGroup().getMonth());
        if(!YearMonth.from(start).equals(assigned)||!YearMonth.from(end).equals(assigned))throw new IllegalArgumentException("Meeting window must remain in the assigned month");
        if(end.isBefore(start))throw new IllegalArgumentException("End date cannot be before start date");
        if(ChronoUnit.DAYS.between(start,end)+1>MAX_WINDOW_DAYS)throw new IllegalArgumentException("Meeting window cannot exceed 10 days");
        if(r.date()!=null)m.setScheduledDate(start);if(r.endDate()!=null)m.setEndDate(end);if(r.time()!=null)m.setScheduledTime(r.time());if(r.venue()!=null)m.setVenue(r.venue().trim());
        if(r.status()!=null){
            if(!admin&&LocalDate.now(ZoneId.of("Asia/Kolkata")).isBefore(end.plusDays(1))){
                List<PairMeeting> all=pairs.findByMeetingIdOrderByIdAsc(m.getId());
                if(all.stream().anyMatch(p->!p.isCompleted()))throw new IllegalStateException("The host can submit early only after every one-to-one meeting is complete");
            }
            int percentage=percentage(m);m.setStatus(percentage==100?AutomatedMeetingStatus.COMPLETED:AutomatedMeetingStatus.INCOMPLETE);
        }
        if(!admin&&detailsChange)m.setEditCount(m.getEditCount()+1);MeetingView result=view(meetings.save(m),actor);
        if(detailsChange)for(MeetingParticipant p:participants.findByGroupIdOrderByMemberFullNameAsc(m.getGroup().getId()))if(!p.getMember().getId().equals(actor.getId()))notifications.notify(p.getMember(),"Meeting window updated","Your Group "+m.getGroup().getGroupNumber()+" window is "+start+" to "+end+".");
        return result;
    }

    @Transactional
    public PairView completePair(Long meetingId,Long pairId,User actor,LocalDate metOn,String notes,MultipartFile photo) throws IOException {
        MonthlyMeeting m=find(meetingId);PairMeeting pair=pairs.findById(pairId).orElseThrow(()->new EntityNotFoundException("One-to-one meeting not found"));
        if(!pair.getMeeting().getId().equals(meetingId))throw new IllegalArgumentException("One-to-one meeting does not belong to this monthly group");
        if(!isPairMember(pair,actor))throw new SecurityException("Only the two assigned members can update this meeting");
        if(pair.isCompleted())throw new IllegalStateException("This one-to-one meeting has already been completed");
        if(metOn==null||metOn.isBefore(m.getScheduledDate())||metOn.isAfter(effectiveEnd(m)))throw new IllegalArgumentException("Meeting date must be inside the group meeting window");
        if(metOn.isAfter(LocalDate.now(ZoneId.of("Asia/Kolkata"))))throw new IllegalArgumentException("Meeting date cannot be in the future");
        if(photo==null||photo.isEmpty())throw new IllegalArgumentException("A meeting photo is required");
        String type=Optional.ofNullable(photo.getContentType()).orElse("");if(!type.startsWith("image/"))throw new IllegalArgumentException("Only image files are allowed");
        pair.setMetOn(metOn);pair.setNotes(notes==null?null:notes.trim());pair.setPhotoUrl(media.uploadPairMeetingPhoto(photo,meetingId,actor.getId()));pair.setCompletedBy(actor);pair.setCompletedAt(LocalDateTime.now());
        PairMeeting saved=pairs.save(pair);User other=pair.getMemberOne().getId().equals(actor.getId())?pair.getMemberTwo():pair.getMemberOne();
        notifications.notify(other,"One-to-one meeting completed",actor.getFullName()+" recorded your meeting on "+metOn+".");
        if(!m.getGroup().getHost().getId().equals(actor.getId()))notifications.notify(m.getGroup().getHost(),"Group progress updated",actor.getFullName()+" completed a one-to-one meeting.");
        return pairView(saved,actor);
    }

    @Transactional public CommentView comment(Long id,User actor,String text){MonthlyMeeting m=find(id);if(!participants.existsByGroupIdAndMemberId(m.getGroup().getId(),actor.getId()))throw new SecurityException("Only group members can comment");if(text==null||text.isBlank())throw new IllegalArgumentException("Comment is required");MeetingComment c=new MeetingComment();c.setMeeting(m);c.setAuthor(actor);c.setText(text.trim());c=comments.save(c);if(!m.getGroup().getHost().getId().equals(actor.getId()))notifications.notify(m.getGroup().getHost(),"New meeting comment",actor.getFullName()+" commented on your group meeting.");return commentView(c);}
    private MonthlyMeeting find(Long id){return meetings.findById(id).orElseThrow(()->new EntityNotFoundException("Meeting not found"));}
    private LocalDate effectiveEnd(MonthlyMeeting m){if(m.getEndDate()!=null)return m.getEndDate();LocalDate end=m.getScheduledDate().plusDays(MAX_WINDOW_DAYS-1),monthEnd=YearMonth.of(m.getGroup().getYear(),m.getGroup().getMonth()).atEndOfMonth();return end.isAfter(monthEnd)?monthEnd:end;}
    private void ensurePairs(MonthlyMeeting m){if(!pairs.findByMeetingIdOrderByIdAsc(m.getId()).isEmpty())return;List<User> members=participants.findByGroupIdOrderByMemberFullNameAsc(m.getGroup().getId()).stream().map(MeetingParticipant::getMember).toList();for(int a=0;a<members.size();a++)for(int b=a+1;b<members.size();b++){PairMeeting pair=new PairMeeting();pair.setMeeting(m);pair.setMemberOne(members.get(a));pair.setMemberTwo(members.get(b));pairs.save(pair);}if(m.getEndDate()==null)m.setEndDate(effectiveEnd(m));}
    private boolean isPairMember(PairMeeting p,User u){return p.getMemberOne().getId().equals(u.getId())||p.getMemberTwo().getId().equals(u.getId());}
    private int percentage(MonthlyMeeting m){List<PairMeeting> all=pairs.findByMeetingIdOrderByIdAsc(m.getId());return all.isEmpty()?0:(int)Math.round(all.stream().filter(PairMeeting::isCompleted).count()*100.0/all.size());}
    private MeetingView view(MonthlyMeeting m,User viewer){MeetingGroup g=m.getGroup();List<MemberView> ms=participants.findByGroupIdOrderByMemberFullNameAsc(g.getId()).stream().map(p->member(p.getMember())).toList();List<PairMeeting> all=pairs.findByMeetingIdOrderByIdAsc(m.getId());List<PairView> visible=all.stream().filter(p->viewer==null||g.getHost().getId().equals(viewer.getId())||isPairMember(p,viewer)).map(p->pairView(p,viewer)).toList();List<CommentView> cs=comments.findByMeetingIdOrderByCreatedAtAsc(m.getId()).stream().map(this::commentView).toList();long complete=all.stream().filter(PairMeeting::isCompleted).count();int pct=all.isEmpty()?0:(int)Math.round(complete*100.0/all.size());return new MeetingView(m.getId(),g.getId(),g.getGroupNumber(),g.getChapter().getId(),g.getChapter().getChapterName(),member(g.getHost()),ms,m.getScheduledDate(),effectiveEnd(m),m.getScheduledTime(),m.getVenue(),m.getStatus(),m.getEditCount(),m.getMaxEdits(),complete,all.size(),pct,visible,cs);}
    private MemberView member(User u){return new MemberView(u.getId(),u.getFullName(),u.getProfileImage(),u.getBusinessName());}
    private PairView pairView(PairMeeting p,User viewer){MemberView one=member(p.getMemberOne()),two=member(p.getMemberTwo());MemberView other=viewer!=null&&p.getMemberOne().getId().equals(viewer.getId())?two:viewer!=null&&p.getMemberTwo().getId().equals(viewer.getId())?one:null;return new PairView(p.getId(),one,two,other,p.isCompleted(),p.getMetOn(),p.getNotes(),p.getPhotoUrl(),p.getCompletedBy()==null?null:p.getCompletedBy().getId(),p.getCompletedAt());}
    private CommentView commentView(MeetingComment c){return new CommentView(c.getId(),c.getAuthor().getId(),c.getAuthor().getFullName(),c.getAuthor().getProfileImage(),c.getText(),c.getCreatedAt());}

    public record UpdateRequest(LocalDate date,LocalDate endDate,LocalTime time,String venue,AutomatedMeetingStatus status){}
    public record MemberView(Long id,String name,String avatar,String businessName){}
    public record PairView(Long id,MemberView memberOne,MemberView memberTwo,MemberView otherMember,boolean completed,LocalDate metOn,String notes,String photoUrl,Long completedById,LocalDateTime completedAt){}
    public record CommentView(Long id,Long authorId,String authorName,String avatar,String text,LocalDateTime createdAt){}
    public record MeetingView(Long id,Long groupId,int groupNumber,Long chapterId,String chapterName,MemberView host,List<MemberView> members,LocalDate date,LocalDate endDate,LocalTime time,String venue,AutomatedMeetingStatus status,int editCount,int maxEdits,long completedPairs,int totalPairs,int completionPercentage,List<PairView> pairMeetings,List<CommentView> comments){}
}
