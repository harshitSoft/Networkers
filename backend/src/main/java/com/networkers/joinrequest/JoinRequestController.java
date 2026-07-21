package com.networkers.joinrequest;

import com.networkers.common.ApiResponse;
import com.networkers.user.UserRepository;
import com.networkers.chapter.ChapterRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class JoinRequestController {
    private final JoinRequestRepository requests; private final UserRepository users; private final ChapterRepository chapters;
    public JoinRequestController(JoinRequestRepository requests,UserRepository users,ChapterRepository chapters){this.requests=requests;this.users=users;this.chapters=chapters;}
    @PostMapping("/join-requests") public ApiResponse<JoinRequest> submit(@Valid @RequestBody Request body){
        if(users.existsByEmail(body.email())) throw new IllegalArgumentException("An account already exists for this email");
        if(requests.existsByEmailIgnoreCaseAndStatusIn(body.email(),List.of(JoinRequestStatus.PENDING,JoinRequestStatus.ACCEPTED))) throw new IllegalStateException("A request for this email is already under review");
        JoinRequest r=new JoinRequest();r.setFullName(body.fullName());r.setEmail(body.email().trim().toLowerCase());r.setMobile(body.mobile());r.setBusinessName(body.businessName());r.setBusinessCategory(body.businessCategory());r.setLocation(body.location());r.setMessage(body.message());
        r.setChapter(chapters.findById(body.chapterId()).filter(c -> c.isActive()).orElseThrow(() -> new EntityNotFoundException("Selected chapter is not available")));
        return ApiResponse.ok("Your request has been sent to the Networkers admin",requests.save(r));
    }
    @GetMapping("/admin/join-requests") public ApiResponse<List<JoinRequest>> all(){return ApiResponse.ok("Join requests",requests.findAllByOrderByCreatedAtDesc());}
    @PutMapping("/admin/join-requests/{id}/accept") public ApiResponse<JoinRequest> accept(@PathVariable Long id){JoinRequest r=get(id);if(r.getStatus()!=JoinRequestStatus.PENDING)throw new IllegalStateException("Only pending requests can be accepted");r.setStatus(JoinRequestStatus.ACCEPTED);return ApiResponse.ok("Request accepted",requests.save(r));}
    @PutMapping("/admin/join-requests/{id}/reject") public ApiResponse<JoinRequest> reject(@PathVariable Long id){JoinRequest r=get(id);if(r.getStatus()==JoinRequestStatus.ACCOUNT_CREATED)throw new IllegalStateException("An account has already been created");r.setStatus(JoinRequestStatus.REJECTED);return ApiResponse.ok("Request rejected",requests.save(r));}
    private JoinRequest get(Long id){return requests.findById(id).orElseThrow(()->new EntityNotFoundException("Join request not found"));}
    public record Request(@NotBlank String fullName,@Email @NotBlank String email,@NotBlank String mobile,String businessName,String businessCategory,String location,String message,@jakarta.validation.constraints.NotNull Long chapterId){}
}
