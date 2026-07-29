package com.networkers.admin;

import com.networkers.auth.AuthController;
import com.networkers.chapter.Chapter;
import com.networkers.chapter.ChapterRepository;
import com.networkers.business.BusinessProfileRepository;
import com.networkers.common.ApiResponse;
import com.networkers.connection.ConnectionRepository;
import com.networkers.meetup.MeetupRepository;
import com.networkers.meetup.MeetupStatus;
import com.networkers.referral.ReferralRepository;
import com.networkers.referral.ReferralStatus;
import com.networkers.user.Role;
import com.networkers.user.User;
import com.networkers.user.UserRepository;
import com.networkers.security.CurrentUser;
import com.networkers.joinrequest.JoinRequest;
import com.networkers.joinrequest.JoinRequestRepository;
import com.networkers.joinrequest.JoinRequestStatus;
import com.networkers.mail.AccountMailService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepository users;
    private final ChapterRepository chapters;
    private final PasswordEncoder encoder;
    private final BusinessProfileRepository businesses;
    private final ConnectionRepository connections;
    private final ReferralRepository referrals;
    private final MeetupRepository meetups;
    private final JoinRequestRepository joinRequests;
    private final AccountMailService mail;
    private final UserDeletionService userDeletionService;
    public AdminController(UserRepository users, ChapterRepository chapters, PasswordEncoder encoder, BusinessProfileRepository businesses, ConnectionRepository connections, ReferralRepository referrals, MeetupRepository meetups, JoinRequestRepository joinRequests, AccountMailService mail, UserDeletionService userDeletionService) {
        this.users = users; this.chapters = chapters; this.encoder = encoder; this.businesses = businesses; this.connections = connections; this.referrals = referrals; this.meetups = meetups; this.joinRequests = joinRequests; this.mail = mail; this.userDeletionService = userDeletionService;
    }
    @GetMapping("/dashboard") public ApiResponse<Map<String, Object>> dashboard() { return ApiResponse.ok("Dashboard", analytics()); }
    @GetMapping("/users") public ApiResponse<?> users() { return ApiResponse.ok("Users", users.findByRole(Role.USER)); }
    @Transactional
    @PostMapping("/users/create") public ApiResponse<?> createUser(@RequestBody CreateUserRequest request) {
        validateUserRequest(request, true);
        if (users.existsByEmail(request.email())) throw new IllegalArgumentException("Email already registered");
        JoinRequest joinRequest = request.joinRequestId() == null ? null : joinRequests.findById(request.joinRequestId()).orElseThrow(() -> new EntityNotFoundException("Join request not found"));
        Long assignedChapterId = request.chapterId() != null ? request.chapterId() : joinRequest != null && joinRequest.getChapter() != null ? joinRequest.getChapter().getId() : null;
        if (assignedChapterId == null) throw new IllegalArgumentException("A chapter must be assigned before creating a user. Create a chapter first if none are available.");
        if (joinRequest != null && joinRequest.getStatus() != JoinRequestStatus.ACCEPTED) throw new IllegalStateException("Join request must be accepted first");
        User user = new User();
        applyUser(user, request, assignedChapterId);
        user.setPassword(encoder.encode(request.password()));
        User saved = users.save(user);
        mail.sendApproval(saved.getFullName(), saved.getEmail(), request.password());
        if (joinRequest != null) { joinRequest.setStatus(JoinRequestStatus.ACCOUNT_CREATED); joinRequests.save(joinRequest); }
        return ApiResponse.ok("User created and login credentials emailed", AuthController.userDto(saved));
    }
    @PutMapping("/users/{id}") public ApiResponse<?> updateUser(@PathVariable Long id, @RequestBody CreateUserRequest request) {
        validateUserRequest(request, false);
        User user = users.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_ADMIN) throw new IllegalStateException("Admin accounts are protected; use My Profile for personal changes");
        users.findByEmail(request.email()).filter(existing -> !existing.getId().equals(id)).ifPresent(existing -> { throw new IllegalArgumentException("Email already registered"); });
        applyUser(user, request, request.chapterId());
        if (request.password() != null && !request.password().isBlank()) user.setPassword(encoder.encode(request.password()));
        return ApiResponse.ok("User updated", AuthController.userDto(users.save(user)));
    }
    @PutMapping("/users/{id}/block") public ApiResponse<?> block(@PathVariable Long id) { var u = manageableUser(id); u.setEnabled(false); return ApiResponse.ok("User blocked", users.save(u)); }
    @PutMapping("/users/{id}/unblock") public ApiResponse<?> unblock(@PathVariable Long id) { var u = manageableUser(id); u.setEnabled(true); return ApiResponse.ok("User unblocked", users.save(u)); }
    @DeleteMapping("/users/{id}") public ApiResponse<?> deleteUser(@PathVariable Long id) {
        var u = users.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (u.getRole() == Role.ADMIN || u.getRole() == Role.SUPER_ADMIN) throw new IllegalStateException("Admin accounts are protected and cannot be deleted");
        if (u.getId().equals(CurrentUser.get().getId())) throw new IllegalStateException("Admin cannot delete themselves");
        userDeletionService.permanentlyDelete(u);
        return ApiResponse.ok("User and related data permanently deleted", true);
    }
    @GetMapping("/businesses") public ApiResponse<?> businesses() { return ApiResponse.ok("Businesses", businesses.findAll()); }
    @PutMapping("/businesses/{id}/verify") public ApiResponse<?> verify(@PathVariable Long id) { var b = businesses.findById(id).orElseThrow(() -> new EntityNotFoundException("Business not found")); b.setVerified(true); return ApiResponse.ok("Business verified", businesses.save(b)); }
    @GetMapping("/referrals") public ApiResponse<?> referrals() { return ApiResponse.ok("Referrals", referrals.findAll()); }
    @GetMapping("/analytics") public ApiResponse<Map<String, Object>> analyticsEndpoint() { return ApiResponse.ok("Analytics", analytics()); }
    private Map<String, Object> analytics() {
        return Map.of(
                "totalUsers", users.countByRoleAndDeletedFalse(Role.USER),
                "totalBusinesses", businesses.count(),
                "totalConnections", connections.count(),
                "totalReferrals", referrals.count(),
                "convertedReferrals", referrals.countByStatus(ReferralStatus.CONFIRMED) + referrals.countByStatus(ReferralStatus.COMPLETED),
                "totalBusinessGenerated", referrals.totalBusinessGenerated(),
                "totalMeetups", meetups.count(),
                "upcomingMeetups", meetups.countByStatus(MeetupStatus.UPCOMING),
                "pendingJoinRequests", joinRequests.countByStatus(JoinRequestStatus.PENDING));
    }
    private User manageableUser(Long id) { User user = users.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found")); if (user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_ADMIN) throw new IllegalStateException("Admin accounts are protected"); return user; }
    private void validateUserRequest(CreateUserRequest request, boolean passwordRequired) {
        if (request.fullName() == null || request.fullName().isBlank()) throw new IllegalArgumentException("Full name is required");
        if (request.email() == null || !request.email().trim().matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) throw new IllegalArgumentException("Enter a valid email address");
        if (request.mobile() == null || !request.mobile().matches("^\\d{10}$")) throw new IllegalArgumentException("Mobile number must contain exactly 10 digits");
        if (passwordRequired && (request.password() == null || request.password().length() < 8)) throw new IllegalArgumentException("Password must be at least 8 characters");
        if (request.password() != null && !request.password().isBlank() && request.password().length() < 8) throw new IllegalArgumentException("Password must be at least 8 characters");
    }
    private void applyUser(User user, CreateUserRequest request, Long chapterId) {
        Chapter chapter = chapterId == null ? null : chapters.findById(chapterId).orElseThrow(() -> new EntityNotFoundException("Chapter not found"));
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setMobile(request.mobile());
        user.setRole(request.role() == null ? Role.USER : request.role());
        user.setBusinessName(request.businessName());
        user.setBusinessCategory(request.businessCategory());
        user.setServices(request.services());
        user.setLocation(request.location());
        user.setChapter(chapter);
        // Chapter assignment is the source of truth for membership pricing.
        user.setSubscriptionPlan(chapter == null ? request.subscriptionPlan() : chapter.getSubscriptionName());
        user.setSubscriptionAmount(chapter == null ? null : chapter.getSubscriptionAmount());
        user.setSubscriptionStartDate(request.subscriptionStartDate());
        user.setSubscriptionEndDate(request.subscriptionEndDate());
        user.setEnabled(request.enabled() == null || request.enabled());
    }
    public record CreateUserRequest(String fullName, String email, String mobile, String password, Role role,
                                    String businessName, String businessCategory, String services, String location,
                                    Long chapterId, String subscriptionPlan, LocalDate subscriptionStartDate,
                                    LocalDate subscriptionEndDate, Boolean enabled, Long joinRequestId) {}
}
