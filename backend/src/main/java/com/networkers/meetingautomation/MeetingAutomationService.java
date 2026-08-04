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
    private final MeetingCycleRepository cycles;

    public MeetingAutomationService(ChapterRepository c,UserRepository u,MeetingGroupRepository g,MeetingParticipantRepository p,
      MonthlyMeetingRepository m,MeetingCommentRepository x,PairMeetingRepository pairs,PostRepository posts,
      NotificationService n,CloudinaryImageService media,MeetingCycleRepository cycles){
        chapters=c;users=u;groups=g;participants=p;meetings=m;comments=x;this.pairs=pairs;this.posts=posts;notifications=n;this.media=media;
        this.cycles=cycles;
    }

    @Scheduled(cron="0 10 1 * * *",zone="Asia/Kolkata") @Transactional
    public void cycleAutomation(){
        LocalDate today=today();
        for(Chapter chapter:chapters.findByActiveTrueOrderByChapterNumberAsc()){
            MeetingCycle active=cycles.findFirstByChapterIdAndStatusOrderByCycleNumberDesc(chapter.getId(),MeetingCycleStatus.ACTIVE).orElse(null);
            if(active!=null){evaluateCycle(active);if(active.getStatus()==MeetingCycleStatus.ACTIVE){List<MonthlyMeeting> scheduled=meetings.findByGroupCycleIdOrderByScheduledDateAscGroupGroupNumberAsc(active.getId());LocalDate lastEnd=scheduled.stream().map(this::effectiveEnd).max(LocalDate::compareTo).orElse(active.getStartDate().minusDays(5));if(!today.isBefore(lastEnd.plusDays(5)))generateRound(active,today);}}
            MeetingCycle latest=cycles.findFirstByChapterIdOrderByCycleNumberDesc(chapter.getId()).orElse(null);
            if(latest!=null&&latest.getStatus()==MeetingCycleStatus.COMPLETED&&latest.getNextCycleDate()!=null&&!today.isBefore(latest.getNextCycleDate()))createCycle(chapter,today,latest.getCycleNumber()+1);
        }
    }

    @Transactional public CycleOverview startCycle(Long chapterId){Chapter chapter=chapters.findById(chapterId).orElseThrow(()->new EntityNotFoundException("Chapter not found"));if(cycles.findFirstByChapterIdAndStatusOrderByCycleNumberDesc(chapterId,MeetingCycleStatus.ACTIVE).isPresent())throw new IllegalStateException("This chapter already has an active cycle");int number=cycles.findFirstByChapterIdOrderByCycleNumberDesc(chapterId).map(c->c.getCycleNumber()+1).orElse(1);return cycleOverview(createCycle(chapter,today(),number));}
    @Transactional public CycleOverview cycleOverview(Long chapterId){MeetingCycle cycle=cycles.findFirstByChapterIdOrderByCycleNumberDesc(chapterId).orElseThrow(()->new EntityNotFoundException("No face-to-face cycle has been started for this chapter"));evaluateCycle(cycle);return cycleOverview(cycle);}
    @Transactional public CycleOverview regenerateCycle(Long cycleId){MeetingCycle cycle=cycles.findById(cycleId).orElseThrow(()->new EntityNotFoundException("Cycle not found"));deleteCycleGroups(cycle);cycle.setStartDate(today());cycle.setCompletedDate(null);cycle.setNextCycleDate(null);cycle.setStatus(MeetingCycleStatus.ACTIVE);cycles.save(cycle);generateRound(cycle,today());return cycleOverview(cycle);}
    @Transactional public CycleDashboard mineCycle(User user){if(user.getChapter()==null)throw new IllegalStateException("A chapter assignment is required for face-to-face cycles");MeetingCycle cycle=cycles.findFirstByChapterIdAndStatusOrderByCycleNumberDesc(user.getChapter().getId(),MeetingCycleStatus.ACTIVE).orElseGet(()->cycles.findFirstByChapterIdOrderByCycleNumberDesc(user.getChapter().getId()).orElseThrow(()->new EntityNotFoundException("No face-to-face cycle has been started yet")));List<MonthlyMeeting> assigned=meetings.findByGroupCycleIdOrderByScheduledDateAscGroupGroupNumberAsc(cycle.getId()).stream().filter(m->participants.existsByGroupIdAndMemberId(m.getGroup().getId(),user.getId())).toList();LocalDate now=today();MonthlyMeeting selected=assigned.stream().filter(m->!now.isBefore(m.getScheduledDate())&&!now.isAfter(effectiveEnd(m))).findFirst().orElseGet(()->assigned.stream().filter(m->m.getScheduledDate().isAfter(now)).findFirst().orElse(assigned.isEmpty()?null:assigned.get(assigned.size()-1)));return new CycleDashboard(cycleView(cycle),selected==null?null:view(selected,user),leaderboard(cycle),cycleProgress(cycle));}

    private MeetingCycle createCycle(Chapter chapter,LocalDate start,int number){List<User> members=activeMembers(chapter);if(members.size()<2)throw new IllegalArgumentException("At least 2 active chapter members are required to start a cycle");MeetingCycle cycle=new MeetingCycle();cycle.setChapter(chapter);cycle.setCycleNumber(number);cycle.setStartDate(start);cycle=cycles.save(cycle);generateRound(cycle,start);return cycle;}
    private void generateRound(MeetingCycle cycle,LocalDate start){
        List<User> remaining=new ArrayList<>(activeMembers(cycle.getChapter()));Set<String> completed=completedKeys(cycle);Map<String,Integer> attempts=new HashMap<>();for(PairMeeting pair:pairs.findByMeetingGroupCycleId(cycle.getId()))attempts.merge(pairKey(pair.getMemberOne(),pair.getMemberTwo()),1,Integer::sum);if(completed.size()>=possiblePairs(remaining.size())){completeCycle(cycle);return;}
        int round=groups.findByCycleIdOrderByRoundNumberAscGroupNumberAsc(cycle.getId()).stream().mapToInt(MeetingGroup::getRoundNumber).max().orElse(0)+1;List<List<User>> buckets=new ArrayList<>();
        Collections.shuffle(remaining);int bucketCount=(int)Math.ceil(remaining.size()/(double)MAX_GROUP_SIZE);for(int i=0;i<bucketCount;i++){List<User> bucket=new ArrayList<>();bucket.add(remaining.remove(0));buckets.add(bucket);}while(!remaining.isEmpty()){List<User> bucket=buckets.stream().filter(b->b.size()<MAX_GROUP_SIZE).min(Comparator.comparingInt(List::size)).orElseThrow();User best=remaining.stream().max(Comparator.comparingLong(candidate->bucket.stream().mapToLong(member->{String key=pairKey(member,candidate);return completed.contains(key)?-10000L:100L-attempts.getOrDefault(key,0)*10L;}).sum())).orElse(remaining.get(0));bucket.add(best);remaining.remove(best);}
        int global=groups.maxGroupNumber(cycle.getChapter().getId(),start.getYear(),start.getMonthValue());LocalDate end=start.plusDays(MAX_WINDOW_DAYS-1);
        for(List<User> bucket:buckets){List<User[]> unmet=new ArrayList<>();for(int a=0;a<bucket.size();a++)for(int b=a+1;b<bucket.size();b++)if(!completed.contains(pairKey(bucket.get(a),bucket.get(b))))unmet.add(new User[]{bucket.get(a),bucket.get(b)});if(unmet.isEmpty())continue;MeetingGroup group=new MeetingGroup();group.setChapter(cycle.getChapter());group.setCycle(cycle);group.setRoundNumber(round);group.setYear(start.getYear());group.setMonth(start.getMonthValue());group.setGroupNumber(++global);group.setHost(bucket.get(0));group=groups.save(group);for(User member:bucket){MeetingParticipant participant=new MeetingParticipant();participant.setGroup(group);participant.setMember(member);participants.save(participant);}MonthlyMeeting meeting=new MonthlyMeeting();meeting.setGroup(group);meeting.setScheduledDate(start);meeting.setEndDate(end);meeting.setScheduledTime(DEFAULT_TIME);meeting=meetings.save(meeting);for(User[] assignment:unmet){PairMeeting pair=new PairMeeting();pair.setMeeting(meeting);pair.setMemberOne(assignment[0]);pair.setMemberTwo(assignment[1]);pairs.save(pair);}for(User member:bucket)notifications.notify(member,"New face-to-face round","Cycle "+cycle.getCycleNumber()+", round "+round+" runs from "+start+" to "+end+". Complete your assigned one-to-one meetings within 10 days.");}
    }
    private List<User> activeMembers(Chapter chapter){return new ArrayList<>(users.findByChapterAndEnabledTrueAndDeletedFalseOrderByFullNameAsc(chapter));}
    private String pairKey(User a,User b){return Math.min(a.getId(),b.getId())+":"+Math.max(a.getId(),b.getId());}
    private Set<String> completedKeys(MeetingCycle cycle){Set<Long> activeIds=activeMembers(cycle.getChapter()).stream().map(User::getId).collect(java.util.stream.Collectors.toSet());Set<String> keys=new HashSet<>();for(PairMeeting pair:pairs.findByMeetingGroupCycleId(cycle.getId()))if(pair.isCompleted()&&activeIds.contains(pair.getMemberOne().getId())&&activeIds.contains(pair.getMemberTwo().getId()))keys.add(pairKey(pair.getMemberOne(),pair.getMemberTwo()));return keys;}
    private long possiblePairs(int members){return (long)members*(members-1)/2;}
    private ProgressView cycleProgress(MeetingCycle cycle){List<User> members=activeMembers(cycle.getChapter());long total=possiblePairs(members.size()),done=completedKeys(cycle).size();return new ProgressView(done,total,total==0?0:(int)Math.round(done*100.0/total));}
    private List<ScoreView> leaderboard(MeetingCycle cycle){Map<Long,Integer> scores=new HashMap<>();Map<Long,User> members=new HashMap<>();for(User u:activeMembers(cycle.getChapter())){members.put(u.getId(),u);scores.put(u.getId(),0);}Set<String> seen=new HashSet<>();for(PairMeeting p:pairs.findByMeetingGroupCycleId(cycle.getId()))if(p.isCompleted()&&seen.add(pairKey(p.getMemberOne(),p.getMemberTwo()))){scores.computeIfPresent(p.getMemberOne().getId(),(k,v)->v+1);scores.computeIfPresent(p.getMemberTwo().getId(),(k,v)->v+1);}return scores.entrySet().stream().map(e->new ScoreView(member(members.get(e.getKey())),e.getValue())).sorted(Comparator.comparingInt(ScoreView::points).reversed().thenComparing(s->s.member().name())).toList();}
    private void evaluateCycle(MeetingCycle cycle){if(cycle.getStatus()!=MeetingCycleStatus.ACTIVE)return;ProgressView progress=cycleProgress(cycle);if(progress.totalPairs()>0&&progress.completedPairs()>=progress.totalPairs())completeCycle(cycle);}
    private void completeCycle(MeetingCycle cycle){LocalDate completed=today();cycle.setStatus(MeetingCycleStatus.COMPLETED);cycle.setCompletedDate(completed);cycle.setNextCycleDate(completed.plusMonths(2));cycles.save(cycle);}
    private void deleteCycleGroups(MeetingCycle cycle){for(MeetingGroup group:groups.findByCycleIdOrderByRoundNumberAscGroupNumberAsc(cycle.getId())){posts.unlinkMeetingGroup(group.getId());comments.deleteByMeetingGroupId(group.getId());pairs.deleteByMeetingGroupId(group.getId());meetings.deleteByGroupId(group.getId());participants.deleteByGroupId(group.getId());groups.delete(group);}groups.flush();}
    private LocalDate today(){return LocalDate.now(ZoneId.of("Asia/Kolkata"));}
    private CycleView cycleView(MeetingCycle c){return new CycleView(c.getId(),c.getCycleNumber(),c.getChapter().getId(),c.getChapter().getChapterName(),c.getStartDate(),c.getCompletedDate(),c.getNextCycleDate(),c.getStatus());}
    private CycleOverview cycleOverview(MeetingCycle cycle){return new CycleOverview(cycleView(cycle),meetings.findByGroupCycleIdOrderByScheduledDateAscGroupGroupNumberAsc(cycle.getId()).stream().map(m->view(m,null)).toList(),leaderboard(cycle),cycleProgress(cycle));}

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
    @Transactional public void deleteGroup(Long meetingId){
        MonthlyMeeting meeting=find(meetingId);Long groupId=meeting.getGroup().getId();
        posts.unlinkMeetingGroup(groupId);comments.deleteByMeetingGroupId(groupId);pairs.deleteByMeetingGroupId(groupId);
        meetings.deleteByGroupId(groupId);participants.deleteByGroupId(groupId);groups.deleteById(groupId);
    }

    @Transactional
    public MeetingView edit(Long id,User actor,UpdateRequest r,boolean admin){
        MonthlyMeeting m=find(id);if(!admin&&!m.getGroup().getHost().getId().equals(actor.getId()))throw new SecurityException("Only the assigned host can edit this meeting");
        boolean detailsChange=r.date()!=null||r.endDate()!=null||r.time()!=null||r.venue()!=null;
        if(!admin&&detailsChange&&m.getEditCount()>=m.getMaxEdits())throw new SecurityException("Meeting edit limit reached");
        LocalDate start=r.date()!=null?r.date():m.getScheduledDate(), end=r.endDate()!=null?r.endDate():effectiveEnd(m);
        LocalDate today=LocalDate.now(ZoneId.of("Asia/Kolkata"));
        if((r.date()!=null||r.endDate()!=null)&&(start.isBefore(today)||end.isBefore(today)))throw new IllegalArgumentException("Meeting dates cannot be in the past");
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
        if(notes==null||notes.isBlank())throw new IllegalArgumentException("Meeting description is required");
        if(photo==null||photo.isEmpty())throw new IllegalArgumentException("Meeting photo is required");
        if(metOn==null||metOn.isBefore(m.getScheduledDate())||metOn.isAfter(effectiveEnd(m)))throw new IllegalArgumentException("Meeting date must be inside the group meeting window");
        if(metOn.isAfter(LocalDate.now(ZoneId.of("Asia/Kolkata"))))throw new IllegalArgumentException("Meeting date cannot be in the future");
        String type=Optional.ofNullable(photo.getContentType()).orElse("");if(!type.startsWith("image/"))throw new IllegalArgumentException("Only image files are allowed");
        String photoUrl=media.uploadPairMeetingPhoto(photo,meetingId,actor.getId());
        pair.setMetOn(metOn);pair.setNotes(notes==null?null:notes.trim());pair.setPhotoUrl(photoUrl);pair.setCompletedBy(actor);pair.setCompletedAt(LocalDateTime.now());
        PairMeeting saved=pairs.save(pair);User other=pair.getMemberOne().getId().equals(actor.getId())?pair.getMemberTwo():pair.getMemberOne();
        com.networkers.community.Post story=new com.networkers.community.Post();story.setUser(actor);story.setType(com.networkers.community.PostType.MEETING_MOMENT);story.setTitle("Face-to-Face meeting completed");story.setContent(notes.trim());story.setMeeting(m);story.setMediaType("IMAGE");story.setMediaUrl(photoUrl);story.getMentions().add(pair.getMemberOne());story.getMentions().add(pair.getMemberTwo());posts.save(story);
        notifications.notify(other,"One-to-one meeting completed",actor.getFullName()+" recorded your meeting on "+metOn+".");
        if(m.getGroup().getCycle()!=null)evaluateCycle(m.getGroup().getCycle());
        return pairView(saved,actor);
    }

    @Transactional public CommentView comment(Long id,User actor,String text){MonthlyMeeting m=find(id);if(!participants.existsByGroupIdAndMemberId(m.getGroup().getId(),actor.getId()))throw new SecurityException("Only group members can comment");if(text==null||text.isBlank())throw new IllegalArgumentException("Comment is required");MeetingComment c=new MeetingComment();c.setMeeting(m);c.setAuthor(actor);c.setText(text.trim());return commentView(comments.save(c));}
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
    public record CycleView(Long id,int cycleNumber,Long chapterId,String chapterName,LocalDate startDate,LocalDate completedDate,LocalDate nextCycleDate,MeetingCycleStatus status){}
    public record ProgressView(long completedPairs,long totalPairs,int completionPercentage){}
    public record ScoreView(MemberView member,int points){}
    public record CycleOverview(CycleView cycle,List<MeetingView> groups,List<ScoreView> leaderboard,ProgressView progress){}
    public record CycleDashboard(CycleView cycle,MeetingView currentGroup,List<ScoreView> leaderboard,ProgressView progress){}
}
