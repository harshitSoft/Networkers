package com.networkers.community;

import com.networkers.common.ApiResponse;
import com.networkers.media.CloudinaryImageService;
import com.networkers.meetingautomation.*;
import com.networkers.notification.NotificationService;
import com.networkers.security.CurrentUser;
import com.networkers.user.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDate;
import java.util.*;

@RestController @RequestMapping("/api/community/posts")
public class CommunityController {
    private final PostRepository posts; private final CommentRepository comments; private final MonthlyMeetingRepository meetings;
    private final MeetingParticipantRepository participants; private final PairMeetingRepository pairs; private final UserRepository users; private final CloudinaryImageService media; private final NotificationService notifications;
    public CommunityController(PostRepository p,CommentRepository c,MonthlyMeetingRepository m,MeetingParticipantRepository participants,PairMeetingRepository pairs,UserRepository u,CloudinaryImageService media,NotificationService n){posts=p;comments=c;meetings=m;this.participants=participants;this.pairs=pairs;users=u;this.media=media;notifications=n;}

    @PostMapping(consumes="multipart/form-data") @Transactional
    public ApiResponse<PostView> create(@RequestParam(required=false) Long meetingId,@RequestParam String caption,@RequestParam(required=false) List<Long> mentionIds,@RequestParam(required=false) String existingPhotoUrl,@RequestPart(value="file",required=false) MultipartFile file) throws IOException {
        User actor=CurrentUser.get(); MonthlyMeeting meeting=meetingId==null?null:meetings.findById(meetingId).orElseThrow(()->new EntityNotFoundException("Meeting not found"));
        if(meeting!=null&&!participants.existsByGroupIdAndMemberId(meeting.getGroup().getId(),actor.getId()))throw new SecurityException("Only meeting group members can post for this meeting");
        if(meeting!=null&&meeting.getScheduledDate().isAfter(LocalDate.now()))throw new IllegalStateException("Meeting posts can be created on or after the scheduled date");
        if(caption==null||caption.isBlank())throw new IllegalArgumentException("Caption is required");
        Post post=new Post();post.setUser(actor);post.setType(meeting==null?PostType.BUSINESS_UPDATE:PostType.MEETING_MOMENT);post.setContent(caption.trim());post.setMeeting(meeting);
        if(file!=null&&!file.isEmpty()){String contentType=Optional.ofNullable(file.getContentType()).orElse("");if(!contentType.startsWith("image/")&&!contentType.startsWith("video/"))throw new IllegalArgumentException("Only image or video files are allowed");post.setMediaType(contentType.startsWith("video/")?"VIDEO":"IMAGE");post.setMediaUrl(media.uploadCommunityMedia(file,actor.getId()));}
        else if(meeting!=null&&existingPhotoUrl!=null&&!existingPhotoUrl.isBlank()){boolean available=pairs.findByMeetingIdOrderByIdAsc(meeting.getId()).stream().anyMatch(pair->existingPhotoUrl.equals(pair.getPhotoUrl()));if(!available)throw new IllegalArgumentException("Select an image uploaded for this face-to-face group");post.setMediaType("IMAGE");post.setMediaUrl(existingPhotoUrl);}
        if(meeting!=null&&mentionIds!=null)for(Long id:new LinkedHashSet<>(mentionIds))if(participants.existsByGroupIdAndMemberId(meeting.getGroup().getId(),id))users.findById(id).ifPresent(post.getMentions()::add);
        Post saved=posts.save(post);for(User mentioned:saved.getMentions())if(!mentioned.getId().equals(actor.getId()))notifications.notify(mentioned,"Mentioned in a meeting post",actor.getFullName()+" mentioned you in a meeting moment.");
        return ApiResponse.ok("Meeting post shared",view(saved));
    }
    @GetMapping @Transactional(readOnly=true) public ApiResponse<List<PostView>> all(){return ApiResponse.ok("Community feed",posts.findAllByOrderByCreatedAtDesc().stream().map(this::view).toList());}
    @PostMapping("/{id}/kudos") @Transactional public ApiResponse<PostView> kudos(@PathVariable Long id){Post p=get(id);User actor=CurrentUser.get();boolean alreadyGiven=p.getKudos().stream().anyMatch(u->u.getId().equals(actor.getId()));if(alreadyGiven)p.getKudos().removeIf(u->u.getId().equals(actor.getId()));else p.getKudos().add(actor);posts.saveAndFlush(p);return ApiResponse.ok("Kudos updated",view(p));}
    @PostMapping("/{id}/comments") @Transactional public ApiResponse<CommentView> comment(@PathVariable Long id,@RequestBody CommentRequest r){if(r.content()==null||r.content().isBlank())throw new IllegalArgumentException("Comment is required");Comment c=new Comment();c.setPost(get(id));c.setUser(CurrentUser.get());c.setContent(r.content().trim());return ApiResponse.ok("Comment added",commentView(comments.save(c)));}
    @PutMapping("/{id}") @Transactional public ApiResponse<PostView> update(@PathVariable Long id,@RequestBody UpdatePostRequest r){if(r.caption()==null||r.caption().isBlank())throw new IllegalArgumentException("Caption is required");Post p=owned(id);p.setContent(r.caption().trim());return ApiResponse.ok("Post updated",view(posts.save(p)));}
    @DeleteMapping("/{id}") public ApiResponse<Void> delete(@PathVariable Long id){posts.delete(owned(id));return ApiResponse.ok("Post deleted",null);}
    private Post get(Long id){return posts.findById(id).orElseThrow(()->new EntityNotFoundException("Post not found"));}
    private Post owned(Long id){Post p=get(id);if(!p.getUser().getId().equals(CurrentUser.get().getId()))throw new SecurityException("Only the post owner can delete it");return p;}
    private PostView view(Post p){User current=CurrentUser.get();List<CommentView> cs=comments.findByPostOrderByCreatedAtAsc(p).stream().map(this::commentView).toList();List<MemberView> kudosMembers=p.getKudos().stream().map(this::memberView).toList();return new PostView(p.getId(),memberView(p.getUser()),p.getContent(),p.getMediaUrl(),p.getMediaType(),p.getMeeting()==null?null:p.getMeeting().getId(),p.getMeeting()==null?null:p.getMeeting().getGroup().getChapter().getChapterName(),p.getMentions().stream().map(this::memberView).toList(),kudosMembers.size(),p.getKudos().stream().anyMatch(u->u.getId().equals(current.getId())),kudosMembers,cs,p.getCreatedAt());}
    private MemberView memberView(User u){return new MemberView(u.getId(),u.getFullName(),u.getProfileImage(),u.getBusinessName());}
    private CommentView commentView(Comment c){return new CommentView(c.getId(),new MemberView(c.getUser().getId(),c.getUser().getFullName(),c.getUser().getProfileImage(),c.getUser().getBusinessName()),c.getContent(),c.getCreatedAt());}
    public record CommentRequest(String content){} public record UpdatePostRequest(String caption){} public record MemberView(Long id,String name,String avatar,String businessName){} public record CommentView(Long id,MemberView author,String content,java.time.LocalDateTime createdAt){} public record PostView(Long id,MemberView author,String caption,String mediaUrl,String mediaType,Long meetingId,String chapterName,List<MemberView> mentions,int kudosCount,boolean kudosGiven,List<MemberView> kudosMembers,List<CommentView> comments,java.time.LocalDateTime createdAt){}
}
