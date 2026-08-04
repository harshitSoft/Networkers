package com.networkers.referral;

import com.networkers.common.ApiResponse;
import com.networkers.business.BusinessProfile;
import com.networkers.business.BusinessProfileRepository;
import com.networkers.community.Post;
import com.networkers.community.PostRepository;
import com.networkers.community.PostType;
import com.networkers.notification.NotificationService;
import com.networkers.security.CurrentUser;
import com.networkers.user.User;
import com.networkers.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
public class ReferralController {
    private final ReferralRepository referrals;
    private final ReferralRevenueRepository revenues;
    private final OpenReferralPostRepository openReferralPosts;
    private final UserRepository users;
    private final BusinessProfileRepository businessProfiles;
    private final NotificationService notificationService;
    private final PostRepository posts;
    public ReferralController(ReferralRepository referrals, ReferralRevenueRepository revenues, OpenReferralPostRepository openReferralPosts, UserRepository users, BusinessProfileRepository businessProfiles, NotificationService notificationService, PostRepository posts) {
        this.referrals = referrals; this.revenues = revenues; this.openReferralPosts = openReferralPosts; this.users = users; this.businessProfiles = businessProfiles; this.notificationService = notificationService; this.posts = posts;
    }

    @GetMapping("/api/members")
    public ApiResponse<List<Map<String, Object>>> members(@RequestParam(required = false) Long chapterId,
                                                          @RequestParam(required = false) String category,
                                                          @RequestParam(required = false) String location,
                                                          @RequestParam(required = false) String name) {
        Long currentUserId = CurrentUser.get().getId();
        return ApiResponse.ok("Members", users.searchMembers(chapterId, normalizeFilter(category), normalizeFilter(location), normalizeFilter(name)).stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .map(this::memberDto).toList());
    }

    @GetMapping("/api/referrals/dashboard")
    public ApiResponse<Map<String, Object>> dashboard() {
        User user = CurrentUser.get();
        LocalDate now = LocalDate.now();
        return ApiResponse.ok("Referral dashboard", Map.of(
                "referralsGiven", referrals.countByGivenBy(user),
                "referralsReceived", referrals.countByReceivedBy(user),
                "businessRevenueGiven", revenues.totalGiven(user),
                "businessRevenueEarned", revenues.totalEarned(user),
                "thisMonthBusinessGiven", revenues.monthGiven(user, now.getMonthValue(), now.getYear()),
                "thisMonthBusinessEarned", revenues.monthEarned(user, now.getMonthValue(), now.getYear()),
                "totalBusinessGiven", revenues.totalGiven(user),
                "totalBusinessEarned", revenues.totalEarned(user),
                "currentChapter", user.getChapter() == null ? "" : user.getChapter().getChapterName(),
                "activeSubscription", user.getSubscriptionPlan() == null ? "" : user.getSubscriptionPlan()));
    }

    @PostMapping("/api/referrals/give")
    @Transactional
    public ApiResponse<Referral> give(@Valid @RequestBody ReferralRequest request) {
        requireText(request.clientName(), "Client name");
        requireText(request.clientPhone(), "Client contact number");
        requireText(request.workTitle(), "Work title");
        requireText(request.workCategory(), "Business type");
        return direct(request);
    }

    @PostMapping("/api/referrals")
    public ApiResponse<Referral> create(@Valid @RequestBody ReferralRequest request) {
        return direct(request);
    }

    @PostMapping("/api/referrals/direct") @Transactional public ApiResponse<Referral> direct(@Valid @RequestBody ReferralRequest request) {
        User giver = CurrentUser.get();
        Long receiverId = request.receivedById() != null ? request.receivedById() : request.receiverId();
        if (receiverId == null) throw new IllegalArgumentException("Receiver is required");
        User receiver = users.findById(receiverId).orElseThrow(() -> new EntityNotFoundException("Receiver not found"));
        Referral r = new Referral();
        r.setReferralType(ReferralType.DIRECT); r.setGivenBy(giver); r.setReceivedBy(receiver); r.setClientName(cleanText(request.clientName())); r.setClientCompany(cleanText(request.clientCompany()));
        r.setClientPhone(cleanText(request.clientPhone())); r.setClientEmail(cleanText(request.clientEmail())); r.setWorkName(firstText(request.workName(), request.title()));
        r.setProductOrServiceRequired(request.productOrServiceRequired()); r.setRequirement(request.description() == null ? request.requirement() : request.description());
        r.setWorkTitle(firstText(request.workTitle(), firstText(request.workName(), request.title())));
        r.setWorkCategory(firstText(request.workCategory(), request.productOrServiceRequired()));
        r.setDescription(request.description() == null ? request.requirement() : request.description());
        r.setCompanyName(request.clientCompany()); r.setLocation(request.location());
        BigDecimal estimate = request.estimatedPrice() == null ? request.estimatedBudget() : request.estimatedPrice();
        r.setEstimatedBudget(estimate); r.setEstimatedPrice(estimate); r.setPriority(request.priority() == null ? ReferralPriority.MEDIUM : request.priority());
        r.setNotes(request.notes());
        Referral saved = referrals.save(r);
        notificationService.notify(receiver, "New referral", giver.getFullName() + " shared a client referral with you.");
        return ApiResponse.ok("Referral shared", saved);
    }
    @PostMapping("/api/referrals/open") public ApiResponse<OpenReferralPost> open(@Valid @RequestBody OpenReferralRequest request) {
        User poster = CurrentUser.get();
        OpenReferralPost post = new OpenReferralPost();
        post.setPostedBy(poster);
        post.setWorkName(firstText(request.workName(), request.title()));
        post.setCompanyName(request.companyName());
        post.setProductOrServiceRequired(request.productOrServiceRequired());
        post.setDescription(request.description());
        post.setBudget(request.budget());
        post.setLocation(request.location());
        post.setPosterUrl(request.posterUrl());
        return ApiResponse.ok("Open referral posted", openReferralPosts.save(post));
    }
    @GetMapping("/api/referrals/open/mine") public ApiResponse<List<OpenReferralPost>> myOpenPosts() {
        return ApiResponse.ok("My open referrals", openReferralPosts.findByPostedByOrderByCreatedAtDesc(CurrentUser.get()));
    }
    @GetMapping("/api/referrals/open/network") public ApiResponse<List<OpenReferralPostResponse>> openFromNetwork() {
        User user = CurrentUser.get();
        List<OpenReferralPostResponse> posts = openReferralPosts.openFromNetwork(user).stream()
                .map(post -> new OpenReferralPostResponse(post, referrals.findByOpenReferralPostAndReceivedBy(post, user).isPresent()))
                .toList();
        return ApiResponse.ok("Network open referrals", posts);
    }
    @PostMapping("/api/referrals/open/{id}/contact") public ApiResponse<Referral> contact(@PathVariable Long id) {
        User responder = CurrentUser.get();
        OpenReferralPost post = openReferralPosts.findById(id).orElseThrow(() -> new EntityNotFoundException("Open referral not found"));
        if (!post.isActive()) throw new IllegalStateException("Open referral is closed");
        if (post.getPostedBy().getId().equals(responder.getId())) throw new IllegalStateException("You cannot respond to your own open referral");
        Referral existing = referrals.findByOpenReferralPostAndReceivedBy(post, responder).orElse(null);
        if (existing != null) return ApiResponse.ok("Contact already requested", existing);
        Referral referral = new Referral();
        referral.setReferralType(ReferralType.OPEN);
        referral.setOpenReferralPost(post);
        referral.setGivenBy(post.getPostedBy());
        referral.setReceivedBy(responder);
        referral.setWorkName(post.getWorkName());
        referral.setCompanyName(post.getCompanyName());
        referral.setProductOrServiceRequired(post.getProductOrServiceRequired());
        referral.setRequirement(post.getDescription());
        referral.setEstimatedBudget(post.getBudget());
        referral.setLocation(post.getLocation());
        referral.setPosterUrl(post.getPosterUrl());
        referral.setClientName(responder.getFullName());
        referral.setClientCompany(post.getCompanyName());
        referral.setNotes("Open referral response from connected network.");
        notificationService.notify(post.getPostedBy(), "Open referral response", responder.getFullName() + " requested contact for " + post.getWorkName() + ".");
        return ApiResponse.ok("Contact requested", referrals.save(referral));
    }
    @GetMapping("/api/referrals/received") public ApiResponse<List<Referral>> received() { return ApiResponse.ok("Received referrals", referrals.findByReceivedByOrderByCreatedAtDesc(CurrentUser.get())); }
    @GetMapping("/api/referrals/given") public ApiResponse<List<Referral>> given() { return ApiResponse.ok("Given referrals", referrals.findByGivenByOrderByCreatedAtDesc(CurrentUser.get())); }
    @GetMapping("/api/referrals/{id}") public ApiResponse<Referral> one(@PathVariable Long id) { return ApiResponse.ok("Referral", allowed(id)); }
    @PutMapping("/api/referrals/{id}/status") @Transactional public ApiResponse<Referral> status(@PathVariable Long id, @RequestBody StatusRequest request) {
        Referral r = allowed(id);
        if (!r.getReceivedBy().getId().equals(CurrentUser.get().getId())) throw new IllegalStateException("Only receiver can update status");
        if (!isAllowedNext(r.getStatus(), request.status())) throw new IllegalStateException("Referral status must move one step at a time");
        r.setStatus(request.status());
        if (request.status() == ReferralStatus.COMPLETED) {
            BigDecimal amount = request.confirmedAmount() == null ? r.getEstimatedPrice() : request.confirmedAmount();
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("Confirmed amount is required");
            r.setConfirmedAmount(amount);
            r.setBusinessValue(amount);
            saveRevenue(r, amount);
        }
        notificationService.notify(r.getGivenBy(), "Referral status updated", label(r) + " is now " + request.status());
        Referral saved = referrals.save(r);
        if (request.status() == ReferralStatus.COMPLETED) createReferralSuccessStory(saved);
        return ApiResponse.ok("Status updated", saved);
    }
    @PutMapping("/api/referrals/{id}/business-value") public ApiResponse<Referral> value(@PathVariable Long id, @RequestBody ValueRequest request) {
        Referral r = allowed(id);
        if (!r.getReceivedBy().getId().equals(CurrentUser.get().getId())) throw new IllegalStateException("Only receiver can update business value");
        if (r.getStatus() != ReferralStatus.CONFIRMED && r.getStatus() != ReferralStatus.COMPLETED) throw new IllegalStateException("Business value can be added only after confirmation");
        r.setBusinessValue(request.businessValue());
        r.setConfirmedAmount(request.businessValue());
        saveRevenue(r, request.businessValue());
        return ApiResponse.ok("Business value updated", referrals.save(r));
    }
    private Referral allowed(Long id) {
        Referral r = referrals.findById(id).orElseThrow(() -> new EntityNotFoundException("Referral not found"));
        Long uid = CurrentUser.get().getId();
        if (!r.getGivenBy().getId().equals(uid) && !r.getReceivedBy().getId().equals(uid)) throw new IllegalStateException("Not allowed");
        return r;
    }
    private boolean isAllowedNext(ReferralStatus current, ReferralStatus next) {
        if (current == null) current = ReferralStatus.NEW;
        return switch (current) {
            case NEW -> next == ReferralStatus.ACCEPTED || next == ReferralStatus.DECLINED || next == ReferralStatus.LOST;
            case ACCEPTED -> next == ReferralStatus.IN_DISCUSSION || next == ReferralStatus.LOST;
            case IN_DISCUSSION -> next == ReferralStatus.CONFIRMED || next == ReferralStatus.LOST;
            case CONFIRMED -> next == ReferralStatus.COMPLETED;
            case COMPLETED, DECLINED, CONTACTED, MEETING_SCHEDULED, CONVERTED, LOST -> false;
        };
    }
    private String label(Referral r) {
        if (r.getWorkName() != null && !r.getWorkName().isBlank()) return r.getWorkName();
        if (r.getClientName() != null && !r.getClientName().isBlank()) return r.getClientName();
        return "Referral";
    }
    private String firstText(String primary, String fallback) {
        return primary != null && !primary.isBlank() ? primary : fallback;
    }
    private String normalizeFilter(String value) {
        return value == null ? "" : value.trim();
    }
    private String cleanText(String value) {
        if (value == null) return null;
        String cleaned = value.trim();
        return cleaned.isEmpty() ? null : cleaned;
    }
    private void saveRevenue(Referral referral, BigDecimal amount) {
        ReferralRevenue revenue = revenues.findByReferral(referral).orElseGet(ReferralRevenue::new);
        LocalDate now = LocalDate.now();
        revenue.setReferral(referral);
        revenue.setGiver(referral.getGivenBy());
        revenue.setReceiver(referral.getReceivedBy());
        revenue.setAmount(amount);
        revenue.setMonth(now.getMonthValue());
        revenue.setYear(now.getYear());
        revenues.save(revenue);
    }
    private void createReferralSuccessStory(Referral referral) {
        User giver = referral.getGivenBy();
        Post post = new Post();
        post.setUser(referral.getReceivedBy());
        post.setType(PostType.SUCCESS_STORY);
        post.setTitle("Referral successfully completed");
        post.setContent("Thank you, %s, for the valuable referral and your continued trust. I truly appreciate your support and look forward to many more collaborations! 🙌".formatted(giver.getFullName()));
        post.getMentions().add(giver);
        posts.save(post);
    }
    private Map<String, Object> memberDto(User user) {
        BusinessProfile profile = businessProfiles.findByUser(user).orElse(null);
        return Map.of(
                "id", user.getId(),
                "fullName", user.getFullName() == null ? "" : user.getFullName(),
                "profileImage", firstText(user.getProfileImage(), profile == null ? "" : profile.getLogoUrl()),
                "businessName", profileText(profile == null ? null : profile.getBusinessName(), user.getBusinessName()),
                "businessCategory", profileText(profile == null ? null : profile.getCategory(), user.getBusinessCategory()),
                "services", profileText(profile == null ? null : profile.getServices(), user.getServices()),
                "businessDescription", profile == null || profile.getDescription() == null ? "" : profile.getDescription(),
                "location", profileText(profile == null ? null : profile.getCity(), user.getLocation()),
                "chapterId", user.getChapter() == null ? 0 : user.getChapter().getId(),
                "chapterName", user.getChapter() == null ? "" : user.getChapter().getChapterName());
    }
    private String profileText(String profileValue, String userValue) {
        String value = firstText(profileValue, userValue);
        return value == null ? "" : value;
    }
    private void requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(fieldName + " is required");
    }
    public record ReferralRequest(Long receivedById, Long receiverId, String clientName, String clientCompany, String clientPhone,
                                  String clientEmail, String requirement, String workName, String title, String productOrServiceRequired,
                                  String description, String location, BigDecimal estimatedBudget, BigDecimal estimatedPrice,
                                  String workTitle, String workCategory, ReferralPriority priority, String notes) {}
    public record OpenReferralRequest(String workName, String title, String companyName, String productOrServiceRequired,
                                      String description, BigDecimal budget, String location, String posterUrl) {}
    public record OpenReferralPostResponse(OpenReferralPost post, boolean contactRequested) {}
    public record StatusRequest(@NotNull ReferralStatus status, BigDecimal confirmedAmount) {}
    public record ValueRequest(@NotNull BigDecimal businessValue) {}
}
