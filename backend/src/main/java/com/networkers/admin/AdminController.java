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
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
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
    public AdminController(UserRepository users, ChapterRepository chapters, PasswordEncoder encoder, BusinessProfileRepository businesses, ConnectionRepository connections, ReferralRepository referrals, MeetupRepository meetups) {
        this.users = users; this.chapters = chapters; this.encoder = encoder; this.businesses = businesses; this.connections = connections; this.referrals = referrals; this.meetups = meetups;
    }
    @GetMapping("/dashboard") public ApiResponse<Map<String, Object>> dashboard() { return ApiResponse.ok("Dashboard", analytics()); }
    @GetMapping("/users") public ApiResponse<?> users() { return ApiResponse.ok("Users", users.findByDeletedFalseOrderByCreatedAtDesc()); }
    @PostMapping("/users/create") public ApiResponse<?> createUser(@RequestBody CreateUserRequest request) {
        if (users.existsByEmail(request.email())) throw new IllegalArgumentException("Email already registered");
        User user = new User();
        applyUser(user, request);
        user.setPassword(encoder.encode(request.password()));
        return ApiResponse.ok("User created", AuthController.userDto(users.save(user)));
    }
    @PutMapping("/users/{id}") public ApiResponse<?> updateUser(@PathVariable Long id, @RequestBody CreateUserRequest request) {
        User user = users.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found"));
        applyUser(user, request);
        if (request.password() != null && !request.password().isBlank()) user.setPassword(encoder.encode(request.password()));
        return ApiResponse.ok("User updated", AuthController.userDto(users.save(user)));
    }
    @PutMapping("/users/{id}/block") public ApiResponse<?> block(@PathVariable Long id) { var u = users.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found")); u.setEnabled(false); return ApiResponse.ok("User blocked", users.save(u)); }
    @PutMapping("/users/{id}/unblock") public ApiResponse<?> unblock(@PathVariable Long id) { var u = users.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found")); u.setEnabled(true); return ApiResponse.ok("User unblocked", users.save(u)); }
    @DeleteMapping("/users/{id}") public ApiResponse<?> deleteUser(@PathVariable Long id) {
        var u = users.findById(id).orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (u.getId().equals(CurrentUser.get().getId())) throw new IllegalStateException("Admin cannot delete themselves");
        u.setEnabled(false);
        u.setDeleted(true);
        return ApiResponse.ok("User deleted", users.save(u));
    }
    @GetMapping("/businesses") public ApiResponse<?> businesses() { return ApiResponse.ok("Businesses", businesses.findAll()); }
    @PutMapping("/businesses/{id}/verify") public ApiResponse<?> verify(@PathVariable Long id) { var b = businesses.findById(id).orElseThrow(() -> new EntityNotFoundException("Business not found")); b.setVerified(true); return ApiResponse.ok("Business verified", businesses.save(b)); }
    @GetMapping("/referrals") public ApiResponse<?> referrals() { return ApiResponse.ok("Referrals", referrals.findAll()); }
    @GetMapping("/analytics") public ApiResponse<Map<String, Object>> analyticsEndpoint() { return ApiResponse.ok("Analytics", analytics()); }
    private Map<String, Object> analytics() {
        return Map.of(
                "totalUsers", users.count(),
                "totalBusinesses", businesses.count(),
                "totalConnections", connections.count(),
                "totalReferrals", referrals.count(),
                "convertedReferrals", referrals.countByStatus(ReferralStatus.CONFIRMED) + referrals.countByStatus(ReferralStatus.COMPLETED),
                "totalBusinessGenerated", referrals.totalBusinessGenerated(),
                "totalMeetups", meetups.count(),
                "upcomingMeetups", meetups.countByStatus(MeetupStatus.UPCOMING));
    }
    private void applyUser(User user, CreateUserRequest request) {
        Chapter chapter = request.chapterId() == null ? null : chapters.findById(request.chapterId()).orElseThrow(() -> new EntityNotFoundException("Chapter not found"));
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setMobile(request.mobile());
        user.setRole(request.role() == null ? Role.USER : request.role());
        user.setBusinessName(request.businessName());
        user.setBusinessCategory(request.businessCategory());
        user.setServices(request.services());
        user.setLocation(request.location());
        user.setChapter(chapter);
        user.setSubscriptionPlan(request.subscriptionPlan());
        user.setSubscriptionStartDate(request.subscriptionStartDate());
        user.setSubscriptionEndDate(request.subscriptionEndDate());
        user.setEnabled(request.enabled() == null || request.enabled());
    }
    public record CreateUserRequest(String fullName, String email, String mobile, String password, Role role,
                                    String businessName, String businessCategory, String services, String location,
                                    Long chapterId, String subscriptionPlan, LocalDate subscriptionStartDate,
                                    LocalDate subscriptionEndDate, Boolean enabled) {}
}
