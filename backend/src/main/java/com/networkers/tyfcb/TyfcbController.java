package com.networkers.tyfcb;

import com.networkers.common.ApiResponse;
import com.networkers.notification.NotificationService;
import com.networkers.referral.Referral;
import com.networkers.referral.ReferralRepository;
import com.networkers.security.CurrentUser;
import com.networkers.user.User;
import com.networkers.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/tyfcb")
public class TyfcbController {
    private final TyfcbRepository records;
    private final UserRepository users;
    private final ReferralRepository referrals;
    private final NotificationService notifications;
    public TyfcbController(TyfcbRepository records, UserRepository users, ReferralRepository referrals, NotificationService notifications) {
        this.records=records; this.users=users; this.referrals=referrals; this.notifications=notifications;
    }

    @PostMapping @Transactional
    public ApiResponse<Map<String,Object>> create(@Valid @RequestBody Request request) {
        User sender=CurrentUser.get();
        User recipient=users.findById(request.thankYouToId()).orElseThrow(()->new EntityNotFoundException("Member not found"));
        if (!recipient.isEnabled() || recipient.isDeleted() || recipient.getRole()==null || recipient.getRole().name().equals("ADMIN") || recipient.getRole().name().equals("SUPER_ADMIN")) throw new IllegalArgumentException("Select an active member");
        if (sender.getId().equals(recipient.getId())) throw new IllegalArgumentException("You cannot send a TYFCB to yourself");
        if (request.referralId()!=null) {
            Referral referral=referrals.findById(request.referralId()).orElseThrow(()->new EntityNotFoundException("Referral not found"));
            if (!referral.getReceivedBy().getId().equals(sender.getId()) || !referral.getGivenBy().getId().equals(recipient.getId())) throw new IllegalArgumentException("The referral must be given by the selected member and received by you");
            if (records.existsByReferralId(referral.getId())) throw new IllegalStateException("A TYFCB has already been submitted for this referral");
        }
        Tyfcb item=new Tyfcb(); item.setThankYouTo(recipient); item.setReceivedBy(sender); item.setBusinessAmount(request.businessAmount());
        item.setBusinessType(request.businessType()); item.setReferralType(request.referralType()); item.setBusinessDescription(clean(request.businessDescription()));
        item.setBusinessDate(request.businessDate()==null?LocalDate.now():request.businessDate()); item.setComments(clean(request.comments()));
        if(request.referralId()!=null) item.setReferral(referrals.getReferenceById(request.referralId()));
        item.setReferenceNumber("NW-TYFCB-"+UUID.randomUUID().toString().substring(0,8).toUpperCase(Locale.ROOT));
        Tyfcb saved=records.saveAndFlush(item);
        notifications.notify(recipient,"New TYFCB received",sender.getFullName()+" sent you a TYFCB slip: "+saved.getReferenceNumber()+".","/tyfcb/history?record="+saved.getId());
        return ApiResponse.ok("TYFCB submitted",dto(saved));
    }
    @GetMapping("/given") public ApiResponse<List<Map<String,Object>>> given(){return ApiResponse.ok("Given TYFCB",records.findByReceivedByOrderBySubmittedAtDesc(CurrentUser.get()).stream().map(this::dto).toList());}
    @GetMapping("/received") public ApiResponse<List<Map<String,Object>>> received(){return ApiResponse.ok("Received TYFCB",records.findByThankYouToOrderBySubmittedAtDesc(CurrentUser.get()).stream().map(this::dto).toList());}
    @GetMapping("/dashboard") public ApiResponse<Map<String,Object>> dashboard(){User u=CurrentUser.get(); var g=records.findByReceivedByOrderBySubmittedAtDesc(u);var r=records.findByThankYouToOrderBySubmittedAtDesc(u);return ApiResponse.ok("TYFCB dashboard",Map.of("givenCount",g.size(),"receivedCount",r.size(),"givenAmount",sum(g),"receivedAmount",sum(r),"successfulTransactions",g.size()+r.size()));}
    @GetMapping("/members") public ApiResponse<List<Map<String,Object>>> members(@RequestParam(required=false) String name){String query=name==null?"":name.trim().toLowerCase(Locale.ROOT);return ApiResponse.ok("Eligible members",users.findAll().stream().filter(u->!u.getId().equals(CurrentUser.get().getId())&&u.isEnabled()&&!u.isDeleted()&&u.getRole()!=null&&u.getRole().name().equals("USER")&&(query.isBlank()||(u.getFullName()!=null&&u.getFullName().toLowerCase(Locale.ROOT).contains(query))||(u.getBusinessName()!=null&&u.getBusinessName().toLowerCase(Locale.ROOT).contains(query)))).map(this::member).toList());}
    @GetMapping("/{id}") public ApiResponse<Map<String,Object>> one(@PathVariable Long id){return ApiResponse.ok("TYFCB slip",dto(owned(id)));}
    @GetMapping("/{id}/slip") public ApiResponse<Map<String,Object>> slip(@PathVariable Long id){return ApiResponse.ok("TYFCB slip",dto(owned(id)));}
    private Tyfcb owned(Long id){Tyfcb t=records.findById(id).orElseThrow(()->new EntityNotFoundException("TYFCB not found"));Long uid=CurrentUser.get().getId();if(!t.getReceivedBy().getId().equals(uid)&&!t.getThankYouTo().getId().equals(uid))throw new IllegalStateException("Not allowed");return t;}
    private BigDecimal sum(List<Tyfcb> list){return list.stream().map(Tyfcb::getBusinessAmount).reduce(BigDecimal.ZERO,BigDecimal::add);}
    private String clean(String s){return s==null?null:s.trim();}
    private Map<String,Object> member(User u){Map<String,Object> m=new LinkedHashMap<>();m.put("id",u.getId());m.put("fullName",u.getFullName());m.put("profileImage",u.getProfileImage());m.put("businessName",u.getBusinessName());m.put("chapter",u.getChapter()==null?null:u.getChapter().getChapterName());return m;}
    private Map<String,Object> dto(Tyfcb t){Map<String,Object> m=new LinkedHashMap<>();m.put("id",t.getId());m.put("referenceNumber",t.getReferenceNumber());m.put("thankYouTo",member(t.getThankYouTo()));m.put("receivedBy",member(t.getReceivedBy()));m.put("businessAmount",t.getBusinessAmount());m.put("businessType",t.getBusinessType());m.put("referralType",t.getReferralType());m.put("businessDescription",t.getBusinessDescription());m.put("referralId",t.getReferral()==null?null:t.getReferral().getId());m.put("businessDate",t.getBusinessDate());m.put("comments",t.getComments());m.put("submittedAt",t.getSubmittedAt());m.put("chapter",t.getReceivedBy().getChapter()==null?null:t.getReceivedBy().getChapter().getChapterName());m.put("status","SUBMITTED");return m;}
    public record Request(@NotNull Long thankYouToId,@NotNull @DecimalMin(value="0.01") @Digits(integer=17,fraction=2) BigDecimal businessAmount,@NotBlank @Pattern(regexp="NEW_BUSINESS|REPEAT_BUSINESS") String businessType,@NotBlank @Pattern(regexp="INTERNAL_REFERRAL|EXTERNAL_REFERRAL") String referralType,@Size(max=2000) String businessDescription,Long referralId,LocalDate businessDate,@Size(max=2000) String comments){}
}
