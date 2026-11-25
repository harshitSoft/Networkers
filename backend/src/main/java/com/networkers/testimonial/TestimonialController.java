package com.networkers.testimonial;

import com.networkers.common.ApiResponse;
import com.networkers.common.PageResponse;
import com.networkers.notification.NotificationService;
import com.networkers.security.CurrentUser;
import com.networkers.user.User;
import com.networkers.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController @RequestMapping("/api/testimonials")
public class TestimonialController {
 private final TestimonialRepository records; private final TestimonialReportRepository reports; private final UserRepository users; private final NotificationService notifications;
 public TestimonialController(TestimonialRepository r,TestimonialReportRepository rr,UserRepository u,NotificationService n){records=r;reports=rr;users=u;notifications=n;}

 @PostMapping @Transactional public ApiResponse<Map<String,Object>> create(@Valid @RequestBody CreateRequest req){
  User sender=CurrentUser.get(); User recipient=users.findById(req.recipientId()).orElseThrow(()->new EntityNotFoundException("Member not found"));
  if(!recipient.isEnabled()||recipient.isDeleted()||recipient.getRole()==null||!(recipient.getRole().name().equals("USER")||recipient.getRole().name().equals("BUSINESS_USER")))throw new IllegalArgumentException("Select an active member");
  if(sender.getId().equals(recipient.getId()))throw new IllegalArgumentException("You cannot write a testimonial for yourself");
  String description=clean(req.description()); if(description.length()<20)throw new IllegalArgumentException("Testimonial must be at least 20 characters");
  if(records.existsRecentDuplicate(sender,recipient,description,LocalDateTime.now().minusMinutes(2)))throw new IllegalStateException("This testimonial was just submitted");
  Testimonial t=new Testimonial();t.setSender(sender);t.setRecipient(recipient);t.setDescription(description);t.setExperienceDate(req.experienceDate());t.setStatus(TestimonialStatus.PENDING);t.setVisible(true);t.setReferenceNumber("NW-TST-"+UUID.randomUUID().toString().substring(0,10).toUpperCase(Locale.ROOT));
  Testimonial saved=records.saveAndFlush(t);notifications.notify(recipient,"You Received a New Testimonial!",sender.getFullName()+" has shared a testimonial about your services.","/testimonials/history?record="+saved.getId());return ApiResponse.ok("Testimonial submitted for review",dto(saved));
 }
 @GetMapping("/given") public ApiResponse<?> given(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){var p=records.findBySender(CurrentUser.get(),PageRequest.of(Math.max(page,0),Math.min(100,Math.max(1,size)),Sort.by(Sort.Direction.DESC,"submittedAt")));return ApiResponse.ok("Given testimonials",page(p));}
 @GetMapping("/received") public ApiResponse<?> received(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size,@RequestParam(defaultValue="false") boolean includePending){User u=CurrentUser.get();var pageable=PageRequest.of(Math.max(page,0),Math.min(100,Math.max(1,size)),Sort.by(Sort.Direction.DESC,"submittedAt"));var p=includePending?records.findByRecipient(u,pageable):records.findByRecipientAndStatus(u,TestimonialStatus.APPROVED,pageable);return ApiResponse.ok("Received testimonials",page(p));}
 @GetMapping("/dashboard") public ApiResponse<?> dashboard(){User u=CurrentUser.get();return ApiResponse.ok("Testimonial dashboard",Map.of("receivedCount",records.countByRecipientAndStatus(u,TestimonialStatus.APPROVED),"givenCount",records.countBySender(u),"pendingCount",records.countByRecipientAndStatus(u,TestimonialStatus.PENDING),"recentReceived",records.findTop5ByRecipientAndStatusAndVisibleTrueOrderBySubmittedAtDesc(u,TestimonialStatus.APPROVED).stream().map(this::dto).toList()));}
 @GetMapping("/members") public ApiResponse<?> members(@RequestParam(required=false) String name){String q=name==null?"":name.trim();return ApiResponse.ok("Eligible members",users.searchTestimonialMembers(q).stream().filter(u->!u.getId().equals(CurrentUser.get().getId())).limit(30).map(this::member).toList());}
 @GetMapping("/member/{memberId}") public ApiResponse<?> publicForMember(@PathVariable Long memberId){User recipient=users.findById(memberId).orElseThrow(()->new EntityNotFoundException("Member not found"));return ApiResponse.ok("Approved testimonials",records.findByRecipientAndStatus(recipient,TestimonialStatus.APPROVED,PageRequest.of(0,50,Sort.by(Sort.Direction.DESC,"submittedAt"))).getContent().stream().filter(Testimonial::isVisible).map(this::dto).toList());}
 @GetMapping("/{id}") public ApiResponse<?> one(@PathVariable Long id){Testimonial t=records.findById(id).orElseThrow(()->new EntityNotFoundException("Testimonial not found"));User me=CurrentUser.get();if(!isAdmin(me)&&!t.getSender().getId().equals(me.getId())&&!t.getRecipient().getId().equals(me.getId())&&!(t.getStatus()==TestimonialStatus.APPROVED&&t.isVisible()))throw new IllegalStateException("Not allowed");return ApiResponse.ok("Testimonial",dto(t));}
 @PostMapping("/{id}/report") @Transactional public ApiResponse<?> report(@PathVariable Long id,@Valid @RequestBody ReportRequest req){User me=CurrentUser.get();Testimonial t=records.findById(id).orElseThrow(()->new EntityNotFoundException("Testimonial not found"));if(t.getSender().getId().equals(me.getId()))throw new IllegalArgumentException("You cannot report your own testimonial");if(reports.existsByTestimonialIdAndReporterId(id,me.getId()))throw new IllegalStateException("You have already reported this testimonial");TestimonialReport r=new TestimonialReport();r.setTestimonial(t);r.setReporter(me);r.setReason(clean(req.reason()));reports.save(r);return ApiResponse.ok("Report submitted",Map.of("submitted",true));}
 @GetMapping("/admin") public ApiResponse<?> admin(@RequestParam(required=false) TestimonialStatus status,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="30") int size){requireAdmin();var p=status==null?records.findAllByOrderBySubmittedAtDesc(PageRequest.of(Math.max(page,0),Math.min(100,Math.max(1,size)))):records.findByStatusOrderBySubmittedAtDesc(status,PageRequest.of(Math.max(page,0),Math.min(100,Math.max(1,size))));return ApiResponse.ok("Testimonial moderation",Map.of("items",p.getContent().stream().map(this::dto).toList(),"totalElements",p.getTotalElements(),"totalPages",p.getTotalPages(),"page",p.getNumber()));}
 @GetMapping("/admin/dashboard") public ApiResponse<?> adminDashboard(){requireAdmin();return ApiResponse.ok("Testimonial moderation summary",Map.of("total",records.count(),"approved",records.countByStatus(TestimonialStatus.APPROVED),"pending",records.countByStatus(TestimonialStatus.PENDING),"rejected",records.countByStatus(TestimonialStatus.REJECTED)));}
 @GetMapping("/admin/reports") public ApiResponse<?> adminReports(){requireAdmin();return ApiResponse.ok("Open testimonial reports",reports.findByResolvedFalseOrderByCreatedAtDesc().stream().map(r->Map.of("id",r.getId(),"testimonial",dto(r.getTestimonial()),"reporter",member(r.getReporter()),"reason",r.getReason(),"createdAt",r.getCreatedAt())).toList());}
 @PutMapping("/admin/{id}/moderate") @Transactional public ApiResponse<?> moderate(@PathVariable Long id,@Valid @RequestBody ModerateRequest req){User admin=CurrentUser.get();requireAdmin();Testimonial t=records.findById(id).orElseThrow(()->new EntityNotFoundException("Testimonial not found"));t.setStatus(req.status());t.setVisible(req.status()==TestimonialStatus.APPROVED&&req.visible());t.setModerationNote(clean(req.note()));t.setModeratedAt(LocalDateTime.now());t.setModeratedBy(admin);Testimonial saved=records.save(t);notifications.notify(t.getSender(),"Testimonial moderation update","Your testimonial was "+req.status().name().toLowerCase(Locale.ROOT)+".","/testimonials/history?record="+id);return ApiResponse.ok("Moderation saved",dto(saved));}
 @PutMapping("/admin/reports/{id}/resolve") @Transactional public ApiResponse<?> resolveReport(@PathVariable Long id){User admin=CurrentUser.get();requireAdmin();var r=reports.findById(id).orElseThrow(()->new EntityNotFoundException("Report not found"));r.setResolved(true);r.setReviewedAt(LocalDateTime.now());r.setReviewedBy(admin);reports.save(r);return ApiResponse.ok("Report resolved",Map.of("resolved",true));}
 private void requireAdmin(){if(!isAdmin(CurrentUser.get()))throw new IllegalStateException("Not allowed");} private boolean isAdmin(User u){return u.getRole()!=null&&(u.getRole().name().equals("ADMIN")||u.getRole().name().equals("SUPER_ADMIN"));}
 private String clean(String s){return s==null?null:s.trim();}
 private Map<String,Object> member(User u){Map<String,Object> m=new LinkedHashMap<>();m.put("id",u.getId());m.put("fullName",u.getFullName());m.put("profileImage",u.getProfileImage());m.put("businessName",u.getBusinessName());m.put("businessCategory",u.getBusinessCategory());m.put("chapter",u.getChapter()==null?null:u.getChapter().getChapterName());return m;}
 private Map<String,Object> dto(Testimonial t){Map<String,Object> m=new LinkedHashMap<>();m.put("id",t.getId());m.put("referenceNumber",t.getReferenceNumber());m.put("sender",member(t.getSender()));m.put("recipient",member(t.getRecipient()));m.put("description",t.getDescription());m.put("experienceDate",t.getExperienceDate());m.put("status",t.getStatus());m.put("visible",t.isVisible());m.put("moderationNote",t.getModerationNote());m.put("submittedAt",t.getSubmittedAt());m.put("updatedAt",t.getUpdatedAt());return m;}
 private Map<String,Object> page(org.springframework.data.domain.Page<Testimonial> p){return Map.of("items",p.getContent().stream().map(this::dto).toList(),"page",p.getNumber(),"size",p.getSize(),"totalElements",p.getTotalElements(),"totalPages",p.getTotalPages());}
 public record CreateRequest(@NotNull Long recipientId,@NotNull java.time.LocalDate experienceDate,@NotBlank @Size(min=20,max=1000) String description){}
 public record ReportRequest(@NotBlank @Size(min=5,max=1000) String reason){}
 public record ModerateRequest(@NotNull TestimonialStatus status,boolean visible,@Size(max=1000) String note){}
}
