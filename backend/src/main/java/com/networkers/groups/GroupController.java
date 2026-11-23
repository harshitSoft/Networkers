package com.networkers.groups;

import com.networkers.common.*;
import com.networkers.business.BusinessProfile;
import com.networkers.business.BusinessProfileRepository;
import com.networkers.security.CurrentUser;
import com.networkers.media.CloudinaryImageService;
import com.networkers.user.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class GroupController {
 private final GroupService service; private final UserRepository users; private final BusinessProfileRepository profiles; private final CloudinaryImageService media;
 public GroupController(GroupService s,UserRepository u,BusinessProfileRepository p,CloudinaryImageService media){service=s;users=u;profiles=p;this.media=media;}
 @GetMapping("/group-categories") public ApiResponse<?> categories(){return ApiResponse.ok("Group categories",service.categories());}
 @GetMapping("/groups") public ApiResponse<?> discover(@RequestParam(defaultValue="") String q,@RequestParam(required=false) Long categoryId,@RequestParam(defaultValue="newest") String sort,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="12") int size){return ApiResponse.ok("Groups",service.discover(q,categoryId,sort,page,size));}
 @GetMapping("/groups/suggested") public ApiResponse<?> suggested(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="8") int size){return ApiResponse.ok("Suggested groups",service.suggested(page,size));}
 @PostMapping("/groups") public ApiResponse<?> create(@Valid @RequestBody CreateGroupRequest r){return ApiResponse.ok("Group created",service.create(r.name(),r.description(),r.category(),r.coverImage(),r.invitedMemberIds()));}
 @GetMapping("/groups/{id}") public ApiResponse<?> one(@PathVariable Long id){return ApiResponse.ok("Group",service.get(id));}
 @PutMapping("/groups/{id}") public ApiResponse<?> update(@PathVariable Long id,@Valid @RequestBody CreateGroupRequest r){return ApiResponse.ok("Group updated",service.update(id,r.name(),r.description(),r.category(),r.coverImage()));}
 @DeleteMapping("/groups/{id}") public ApiResponse<?> delete(@PathVariable Long id){service.delete(id);return ApiResponse.ok("Group deactivated",null);}
 @PostMapping("/groups/{id}/join") public ApiResponse<?> join(@PathVariable Long id){return ApiResponse.ok("You joined the group",service.join(id));}
 @DeleteMapping("/groups/{id}/leave") public ApiResponse<?> leave(@PathVariable Long id){service.leave(id);return ApiResponse.ok("You left the group",null);}
 @GetMapping("/groups/{id}/members") public ApiResponse<?> members(@PathVariable Long id,@RequestParam(defaultValue="") String q,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="30") int size){return ApiResponse.ok("Group members",service.members(id,page,size,q));}
 @GetMapping("/groups/my-groups") public ApiResponse<?> myGroups(@RequestParam(defaultValue="all") String type,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return ApiResponse.ok("My groups",service.myGroups(type,page,size));}
 @PostMapping("/groups/{id}/invitations") public ApiResponse<?> invite(@PathVariable Long id,@RequestBody InviteRequest r){return ApiResponse.ok("Invitations sent",service.invite(id,r.memberIds()));}
 @GetMapping("/groups/invitations/received") public ApiResponse<?> received(@RequestParam(defaultValue="SENT") String status,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return ApiResponse.ok("Received invitations",service.invitations(status,true,page,size));}
 @GetMapping("/groups/invitations/sent") public ApiResponse<?> sent(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return ApiResponse.ok("Sent invitations",service.invitations(null,false,page,size));}
 @PostMapping("/groups/invitations/{id}/accept") public ApiResponse<?> accept(@PathVariable Long id){return ApiResponse.ok("Invitation accepted",service.respond(id,true));}
 @PostMapping("/groups/invitations/{id}/decline") public ApiResponse<?> decline(@PathVariable Long id){return ApiResponse.ok("Invitation declined",service.respond(id,false));}
 @DeleteMapping("/groups/invitations/{id}") public ApiResponse<?> cancel(@PathVariable Long id){service.cancelInvitation(id);return ApiResponse.ok("Invitation cancelled",null);}
 @PostMapping("/groups/{id}/topics") public ApiResponse<?> createTopic(@PathVariable Long id,@Valid @RequestBody TopicRequest r){return ApiResponse.ok("Topic published",service.createTopic(id,r.title(),r.description(),r.attachmentUrl()));}
 @PostMapping(value="/groups/upload",consumes="multipart/form-data") public ApiResponse<?> upload(@RequestParam Long groupId,@RequestPart("file") MultipartFile file) throws IOException {service.requireGroupMember(groupId);return ApiResponse.ok("Attachment uploaded",Map.of("url",media.uploadGroupAttachment(file,groupId,CurrentUser.get().getId())));}
 @GetMapping("/groups/{id}/topics") public ApiResponse<?> topics(@PathVariable Long id,@RequestParam(defaultValue="false") boolean history,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return ApiResponse.ok("Group topics",service.topicFeed(id,history,page,size));}
 @GetMapping("/groups/{gid}/topics/{tid}") public ApiResponse<?> topic(@PathVariable Long gid,@PathVariable Long tid,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="50") int size){return ApiResponse.ok("Topic discussion",service.topicDetails(gid,tid,page,size));}
 @PutMapping("/groups/{gid}/topics/{tid}") public ApiResponse<?> editTopic(@PathVariable Long gid,@PathVariable Long tid,@Valid @RequestBody TopicRequest r){return ApiResponse.ok("Topic updated",service.updateTopic(gid,tid,r.title(),r.description(),r.attachmentUrl()));}
 @DeleteMapping("/groups/{gid}/topics/{tid}") public ApiResponse<?> deleteTopic(@PathVariable Long gid,@PathVariable Long tid){service.deleteTopic(gid,tid);return ApiResponse.ok("Topic removed",null);}
 @PostMapping("/groups/{gid}/topics/{tid}/comments") public ApiResponse<?> comment(@PathVariable Long gid,@PathVariable Long tid,@Valid @RequestBody CommentRequest r){return ApiResponse.ok("Comment added",service.addComment(gid,tid,r.comment()));}
 @PutMapping("/groups/{gid}/topics/{tid}/comments/{cid}") public ApiResponse<?> editComment(@PathVariable Long gid,@PathVariable Long tid,@PathVariable Long cid,@Valid @RequestBody CommentRequest r){return ApiResponse.ok("Comment updated",service.editComment(gid,tid,cid,r.comment()));}
 @DeleteMapping("/groups/{gid}/topics/{tid}/comments/{cid}") public ApiResponse<?> deleteComment(@PathVariable Long gid,@PathVariable Long tid,@PathVariable Long cid){service.deleteComment(gid,tid,cid);return ApiResponse.ok("Comment removed",null);}
 @GetMapping("/groups/members/search") public ApiResponse<?> searchMembers(@RequestParam(defaultValue="") String q,@RequestParam(defaultValue="") String chapter,@RequestParam(defaultValue="") String city,@RequestParam(defaultValue="") String country,@RequestParam(defaultValue="") String category,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){String query=q.trim().toLowerCase(),chapterQuery=chapter.trim().toLowerCase(),cityQuery=city.trim().toLowerCase(),countryQuery=country.trim().toLowerCase(),categoryQuery=category.trim().toLowerCase();List<User> eligible=users.findAllBillableMembers().stream().filter(u->u.isEnabled()&&!u.isDeleted()&&!u.getId().equals(CurrentUser.get().getId())).toList();Map<Long,BusinessProfile> profileMap=profiles.findByUserIn(eligible).stream().collect(java.util.stream.Collectors.toMap(x->x.getUser().getId(),x->x,(a,b)->a));List<User> all=eligible.stream().filter(u->{BusinessProfile b=profileMap.get(u.getId());String businessCategory=b==null?u.getBusinessCategory():b.getCategory();String cityValue=b==null?u.getLocation():b.getCity();String fullLocation=txt(u.getLocation())+" "+txt(cityValue)+" "+(b==null?"":txt(b.getState()))+" "+(u.getChapter()==null?"":txt(u.getChapter().getLocation()));return (query.isEmpty()||txt(u.getFullName()).contains(query)||txt(u.getBusinessName()).contains(query)||txt(u.getServices()).contains(query)||b!=null&&(txt(b.getBusinessName()).contains(query)||txt(b.getServices()).contains(query)))&&(chapterQuery.isEmpty()||u.getChapter()!=null&&txt(u.getChapter().getChapterName()).contains(chapterQuery))&&(cityQuery.isEmpty()||txt(cityValue).contains(cityQuery))&&(countryQuery.isEmpty()||fullLocation.contains(countryQuery))&&(categoryQuery.isEmpty()||txt(businessCategory).contains(categoryQuery));}).toList();int safePage=Math.max(0,page),safeSize=Math.max(1,Math.min(50,size)),from=Math.min(safePage*safeSize,all.size()),to=Math.min(from+safeSize,all.size());List<User> selected=all.subList(from,to);List<Map<String,Object>> rows=selected.stream().map(u->{BusinessProfile b=profileMap.get(u.getId());Map<String,Object> m=new LinkedHashMap<>();m.put("id",u.getId());m.put("fullName",u.getFullName());m.put("profileImage",u.getProfileImage());m.put("businessName",b==null?u.getBusinessName():b.getBusinessName());m.put("businessCategory",b==null?u.getBusinessCategory():b.getCategory());m.put("chapterName",u.getChapter()==null?"":u.getChapter().getChapterName());m.put("location",b==null?u.getLocation():b.getCity());return m;}).toList();return ApiResponse.ok("Global member directory",new PageResponse<>(rows,safePage,safeSize,all.size(),(all.size()+safeSize-1)/safeSize));}
 private String txt(String s){return s==null?"":s.toLowerCase();}
 public record CreateGroupRequest(@NotBlank @Size(min=3,max=100) String name,@NotBlank @Size(max=3000) String description,@NotBlank @Size(max=80) String category,@Size(max=1500) String coverImage,List<Long> invitedMemberIds){}
 public record InviteRequest(@NotEmpty List<Long> memberIds){}
 public record TopicRequest(@NotBlank @Size(max=160) String title,@NotBlank @Size(max=10000) String description,@Size(max=1500) String attachmentUrl){}
 public record CommentRequest(@NotBlank @Size(max=2000) String comment){}
}
