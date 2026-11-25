package com.networkers.connection;

import com.networkers.business.BusinessProfile;
import com.networkers.business.BusinessProfileRepository;
import com.networkers.common.ApiResponse;
import com.networkers.common.PageResponse;
import com.networkers.notification.NotificationService;
import com.networkers.security.CurrentUser;
import com.networkers.user.Role;
import com.networkers.user.User;
import com.networkers.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {
    private final ConnectionRepository connections;
    private final UserRepository users;
    private final BusinessProfileRepository businesses;
    private final NotificationService notificationService;

    public ConnectionController(ConnectionRepository connections, UserRepository users,
                                BusinessProfileRepository businesses, NotificationService notificationService) {
        this.connections = connections;
        this.users = users;
        this.businesses = businesses;
        this.notificationService = notificationService;
    }

    @GetMapping("/discover") @Transactional(readOnly = true)
    public ApiResponse<PageResponse<MemberCard>> discover(@RequestParam(defaultValue = "") String q,
                                                           @RequestParam(defaultValue = "") String city,
                                                           @RequestParam(defaultValue = "") String state,
                                                           @RequestParam(defaultValue = "") String country,
                                                           @RequestParam(defaultValue = "") String profession,
                                                           @RequestParam(defaultValue = "") String category,
                                                           @RequestParam(required = false) Long chapterId,
                                                           @RequestParam(required = false) Long groupId,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "20") int size,
                                                           @RequestParam(defaultValue = "relevant") String sort) {
        User viewer = CurrentUser.get();
        Sort order = switch (sort.toLowerCase(Locale.ROOT)) {
            case "alphabetical", "name" -> Sort.by(Sort.Direction.ASC, "fullName");
            case "recent", "recently_joined" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.ASC, "fullName");
        };
        Page<User> result = users.searchGlobalDirectory(viewer.getId(), clean(q), clean(city), clean(state), clean(country), clean(profession), clean(category),
                chapterId, groupId, PageRequest.of(Math.max(0, page), Math.min(50, Math.max(1, size)), order));
        return ApiResponse.ok("Global member directory", pageResponse(result, cards(result.getContent(), viewer)));
    }

    @GetMapping("/suggestions") @Transactional(readOnly = true)
    public ApiResponse<List<MemberCard>> suggestions(@RequestParam(defaultValue = "10") int limit) {
        User viewer = CurrentUser.get();
        List<Connection> relationships = connections.involving(viewer);
        Set<Long> excluded = new HashSet<>();
        excluded.add(viewer.getId());
        relationships.stream().filter(c -> c.getStatus() == ConnectionStatus.PENDING || c.getStatus() == ConnectionStatus.ACCEPTED)
                .forEach(c -> excluded.add(c.getSender().getId().equals(viewer.getId()) ? c.getReceiver().getId() : c.getSender().getId()));
        List<User> candidates = users.searchGlobalDirectory(viewer.getId(), "", "", "", "", "", "", null, null,
                PageRequest.of(0, 100, Sort.by(Sort.Direction.ASC, "fullName"))).getContent().stream()
                .filter(candidate -> !excluded.contains(candidate.getId())).toList();
        Map<Long, BusinessProfile> profiles = profiles(candidates);
        candidates = candidates.stream().sorted(Comparator
                .comparingInt((User candidate) -> relevance(viewer, candidate, profiles.get(candidate.getId()))).reversed()
                .thenComparing(u -> safe(u.getFullName()), String.CASE_INSENSITIVE_ORDER)).limit(Math.min(20, Math.max(1, limit))).toList();
        return ApiResponse.ok("Suggested members", cards(candidates, viewer));
    }

    @GetMapping("/members/{memberId}") @Transactional(readOnly = true)
    public ApiResponse<MemberProfile> memberProfile(@PathVariable Long memberId) {
        User viewer = CurrentUser.get();
        User member = eligibleMember(memberId);
        if (member.getId().equals(viewer.getId())) throw new IllegalArgumentException("Use your own profile to view your details");
        BusinessProfile business = businesses.findByUser(member).orElse(null);
        MemberCard card = card(member, business, status(viewer, member));
        return ApiResponse.ok("Member profile", new MemberProfile(card,
                business == null ? null : business.getDescription(),
                business == null ? null : business.getServices(),
                business == null ? null : business.getLookingFor(),
                business == null ? null : business.getWebsite(),
                business == null ? null : business.getFoundedYear(),
                business == null ? null : business.getTeamSize(),
                business != null && business.isVerified()));
    }

    @GetMapping("/status/{memberId}") @Transactional(readOnly = true)
    public ApiResponse<String> status(@PathVariable Long memberId) {
        User viewer = CurrentUser.get();
        User target = eligibleMember(memberId);
        if (viewer.getId().equals(target.getId())) return ApiResponse.ok("Connection status", "SELF");
        return ApiResponse.ok("Connection status", status(viewer, target).name());
    }

    @GetMapping("/{connectionId}") @Transactional(readOnly = true)
    public ApiResponse<ConnectionDto> connectionDetails(@PathVariable Long connectionId) {
        Connection connection = connections.findById(connectionId).orElseThrow(() -> new EntityNotFoundException("Connection not found"));
        User viewer = CurrentUser.get();
        boolean participant = connection.getSender().getId().equals(viewer.getId()) || connection.getReceiver().getId().equals(viewer.getId());
        boolean admin = viewer.getRole() == Role.ADMIN || viewer.getRole() == Role.SUPER_ADMIN;
        if (!participant && !admin) throw new IllegalStateException("You cannot view this connection");
        return ApiResponse.ok("Connection details", dto(connection));
    }

    @PostMapping("/send/{receiverId}") @Transactional
    public ApiResponse<ConnectionDto> send(@PathVariable Long receiverId, @Valid @RequestBody(required = false) SendRequest request) {
        User sender = CurrentUser.get();
        if (sender.getRole() != Role.USER || sender.isDeleted() || !sender.isEnabled()) throw new IllegalStateException("Only active Networkers members can send connection requests");
        User receiver = eligibleMember(receiverId);
        if (sender.getId().equals(receiver.getId())) throw new IllegalArgumentException("Cannot connect with yourself");
        List<Connection> previous = connections.findAllBySenderAndReceiverOrderByCreatedAtDesc(sender, receiver);
        Optional<Connection> active = previous.stream().filter(c -> c.getStatus() == ConnectionStatus.PENDING || c.getStatus() == ConnectionStatus.ACCEPTED).findFirst();
        if (active.isPresent()) throw new IllegalStateException(active.get().getStatus() == ConnectionStatus.ACCEPTED ? "You are already connected" : "A connection request is already active");
        List<Connection> reverse = connections.findAllBySenderAndReceiverOrderByCreatedAtDesc(receiver, sender);
        Optional<Connection> reverseActive = reverse.stream().filter(c -> c.getStatus() == ConnectionStatus.PENDING || c.getStatus() == ConnectionStatus.ACCEPTED).findFirst();
        if (reverseActive.isPresent()) throw new IllegalStateException(reverseActive.get().getStatus() == ConnectionStatus.PENDING ? "This member has already requested to connect. Review the request you received." : "You are already connected");

        Connection connection = new Connection();
        connection.setSender(sender);
        connection.setReceiver(receiver);
        connection.setMessage(request == null ? null : cleanMessage(request.message()));
        Connection saved = connections.saveAndFlush(connection);
        safeNotify(receiver, "New Connection Request", sender.getFullName() + " wants to connect with you.", "/connections?tab=received");
        return ApiResponse.ok("Connection request sent", dto(saved));
    }

    @PutMapping("/accept/{connectionId}") @Transactional
    public ApiResponse<ConnectionDto> accept(@PathVariable Long connectionId) { return change(connectionId, ConnectionStatus.ACCEPTED); }

    @PutMapping("/reject/{connectionId}") @Transactional
    public ApiResponse<ConnectionDto> reject(@PathVariable Long connectionId) { return change(connectionId, ConnectionStatus.REJECTED); }

    @GetMapping("/received") @Transactional(readOnly = true)
    public ApiResponse<List<ConnectionDto>> received() { return ApiResponse.ok("Received requests", dtos(connections.pendingReceived(CurrentUser.get()))); }

    @GetMapping("/sent") @Transactional(readOnly = true)
    public ApiResponse<List<ConnectionDto>> sent() { return ApiResponse.ok("Sent requests", dtos(connections.pendingSent(CurrentUser.get()))); }

    @GetMapping("/my-network") @Transactional(readOnly = true)
    public ApiResponse<List<ConnectionDto>> network() { return ApiResponse.ok("My network", dtos(connections.network(CurrentUser.get()))); }

    @GetMapping("/my-network/page") @Transactional(readOnly = true)
    public ApiResponse<PageResponse<ConnectionDto>> networkPage(@RequestParam(defaultValue = "") String q,
                                                                 @RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "20") int size) {
        Page<Connection> result = connections.networkPage(CurrentUser.get(), clean(q), PageRequest.of(Math.max(0, page), Math.min(50, Math.max(1, size)), Sort.by(Sort.Direction.DESC, "createdAt")));
        return ApiResponse.ok("My network", pageResponse(result, dtos(result.getContent())));
    }

    @GetMapping("/dashboard") @Transactional(readOnly = true)
    public ApiResponse<Dashboard> dashboard() {
        User user = CurrentUser.get();
        List<Connection> network = connections.network(user);
        List<MemberCard> recent = network.stream().limit(5).map(c -> {
            User other = c.getSender().getId().equals(user.getId()) ? c.getReceiver() : c.getSender();
            return card(other, businesses.findByUser(other).orElse(null), ConnectionStatus.CONNECTED);
        }).toList();
        List<MemberCard> suggestions = suggestions(5).data();
        return ApiResponse.ok("Connections dashboard", new Dashboard(network.size(),
                connections.countRecentForUser(user, LocalDateTime.now().minusDays(30)),
                connections.countByReceiverAndStatus(user, ConnectionStatus.PENDING),
                connections.countBySenderAndStatus(user, ConnectionStatus.PENDING), recent, suggestions));
    }

    @DeleteMapping("/{connectionId}") @Transactional
    public ApiResponse<Void> remove(@PathVariable Long connectionId) {
        Connection c = connections.findByIdForUpdate(connectionId).orElseThrow(() -> new EntityNotFoundException("Connection not found"));
        Long uid = CurrentUser.get().getId();
        if ((!c.getSender().getId().equals(uid) && !c.getReceiver().getId().equals(uid)) || c.getStatus() != ConnectionStatus.ACCEPTED)
            throw new IllegalStateException("Only a connected member can remove this connection");
        c.setStatus(ConnectionStatus.REMOVED);
        c.setRespondedAt(LocalDateTime.now());
        connections.save(c);
        return ApiResponse.ok("Connection removed", null);
    }

    @DeleteMapping("/cancel/{connectionId}") @Transactional
    public ApiResponse<Void> cancel(@PathVariable Long connectionId) {
        Connection c = connections.findByIdForUpdate(connectionId).orElseThrow(() -> new EntityNotFoundException("Connection request not found"));
        if (!c.getSender().getId().equals(CurrentUser.get().getId())) throw new IllegalStateException("Only sender can withdraw request");
        if (c.getStatus() != ConnectionStatus.PENDING) throw new IllegalStateException("Only pending requests can be withdrawn");
        c.setStatus(ConnectionStatus.WITHDRAWN);
        c.setRespondedAt(LocalDateTime.now());
        connections.save(c);
        return ApiResponse.ok("Connection request withdrawn", null);
    }

    @GetMapping("/admin/overview") @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')") @Transactional(readOnly = true)
    public ApiResponse<AdminOverview> adminOverview() {
        return ApiResponse.ok("Connection administration", new AdminOverview(
                connections.countByStatus(ConnectionStatus.ACCEPTED), connections.countByStatus(ConnectionStatus.PENDING),
                connections.countByStatus(ConnectionStatus.REJECTED), connections.countByStatus(ConnectionStatus.WITHDRAWN)));
    }

    @GetMapping("/admin/records") @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')") @Transactional(readOnly = true)
    public ApiResponse<PageResponse<ConnectionDto>> adminRecords(@RequestParam(required = false) String status,
                                                                  @RequestParam(defaultValue = "") String q,
                                                                  @RequestParam(defaultValue = "0") int page,
                                                                  @RequestParam(defaultValue = "20") int size) {
        ConnectionStatus filter = status == null || status.isBlank() ? null : ConnectionStatus.valueOf(status.toUpperCase(Locale.ROOT));
        Page<Connection> result = connections.adminSearch(filter, clean(q), PageRequest.of(Math.max(0, page), Math.min(50, Math.max(1, size)), Sort.by(Sort.Direction.DESC, "createdAt")));
        return ApiResponse.ok("Connection records", pageResponse(result, dtos(result.getContent())));
    }

    private ApiResponse<ConnectionDto> change(Long id, ConnectionStatus next) {
        Connection c = connections.findByIdForUpdate(id).orElseThrow(() -> new EntityNotFoundException("Connection request not found"));
        if (!c.getReceiver().getId().equals(CurrentUser.get().getId())) throw new IllegalStateException("Only the request recipient can respond");
        if (c.getStatus() != ConnectionStatus.PENDING) throw new IllegalStateException("This request is no longer pending");
        c.setStatus(next);
        c.setRespondedAt(LocalDateTime.now());
        Connection saved = connections.save(c);
        if (next == ConnectionStatus.ACCEPTED) {
            safeNotify(c.getSender(), "Connection Request Accepted", c.getReceiver().getFullName() + " accepted your connection request.", "/connections");
        }
        return ApiResponse.ok(next == ConnectionStatus.ACCEPTED ? "Connection accepted" : "Connection request rejected", dto(saved));
    }

    private User eligibleMember(Long id) {
        User user = users.findById(id).orElseThrow(() -> new EntityNotFoundException("Member not found"));
        if (user.isDeleted() || !user.isEnabled() || user.getRole() != Role.USER) throw new IllegalStateException("This member is not available for connections");
        return user;
    }

    private ConnectionStatus status(User viewer, User other) {
        for (Connection c : connections.findAllBySenderAndReceiverOrderByCreatedAtDesc(viewer, other))
            if (c.getStatus() == ConnectionStatus.PENDING) return ConnectionStatus.PENDING_SENT;
            else if (c.getStatus() == ConnectionStatus.ACCEPTED) return ConnectionStatus.CONNECTED;
        for (Connection c : connections.findAllBySenderAndReceiverOrderByCreatedAtDesc(other, viewer))
            if (c.getStatus() == ConnectionStatus.PENDING) return ConnectionStatus.PENDING_RECEIVED;
            else if (c.getStatus() == ConnectionStatus.ACCEPTED) return ConnectionStatus.CONNECTED;
        return ConnectionStatus.NONE;
    }

    private List<MemberCard> cards(List<User> members, User viewer) {
        Map<Long, BusinessProfile> profiles = profiles(members);
        Map<Long, ConnectionStatus> statuses = new HashMap<>();
        for (Connection c : connections.involving(viewer)) {
            Long otherId = c.getSender().getId().equals(viewer.getId()) ? c.getReceiver().getId() : c.getSender().getId();
            if (members.stream().anyMatch(m -> m.getId().equals(otherId))) {
                if (c.getStatus() == ConnectionStatus.ACCEPTED) statuses.put(otherId, ConnectionStatus.CONNECTED);
                else if (c.getStatus() == ConnectionStatus.PENDING) statuses.put(otherId,
                        c.getSender().getId().equals(viewer.getId()) ? ConnectionStatus.PENDING_SENT : ConnectionStatus.PENDING_RECEIVED);
            }
        }
        return members.stream().map(m -> card(m, profiles.get(m.getId()), statuses.getOrDefault(m.getId(), ConnectionStatus.NONE))).toList();
    }

    private Map<Long, BusinessProfile> profiles(List<User> members) {
        if (members.isEmpty()) return Map.of();
        return businesses.findByUserIn(members).stream().collect(Collectors.toMap(b -> b.getUser().getId(), b -> b, (a, b) -> a));
    }

    private MemberCard card(User user, BusinessProfile business, ConnectionStatus status) {
        String businessName = business == null ? user.getBusinessName() : business.getBusinessName();
        String category = business == null ? user.getBusinessCategory() : business.getCategory();
        String services = business == null ? user.getServices() : business.getServices();
        String city = business == null ? user.getLocation() : business.getCity();
        String state = business == null ? null : business.getState();
        String country = business == null ? null : business.getCountry();
        String profession = business == null ? category : business.getProfessionalTitle();
        return new MemberCard(user.getId(), safe(user.getFullName()), user.getProfileImage(), businessName, profession, category,
                services, city, state, country, user.getChapter() == null ? null : user.getChapter().getChapterName(), status.name(),
                business == null ? null : business.getLogoUrl());
    }

    private ConnectionDto dto(Connection c) {
        return dtos(List.of(c)).get(0);
    }

    private List<ConnectionDto> dtos(List<Connection> records) {
        List<User> members = records.stream().flatMap(c -> java.util.stream.Stream.of(c.getSender(), c.getReceiver())).distinct().toList();
        Map<Long, BusinessProfile> profiles = profiles(members);
        return records.stream().map(c -> new ConnectionDto(c.getId(),
                card(c.getSender(), profiles.get(c.getSender().getId()), c.getStatus() == ConnectionStatus.ACCEPTED ? ConnectionStatus.CONNECTED : ConnectionStatus.PENDING_SENT),
                card(c.getReceiver(), profiles.get(c.getReceiver().getId()), c.getStatus() == ConnectionStatus.ACCEPTED ? ConnectionStatus.CONNECTED : ConnectionStatus.PENDING_RECEIVED),
                c.getStatus().name(), c.getMessage(), c.getCreatedAt(), c.getUpdatedAt(), c.getRespondedAt())).toList();
    }

    private int relevance(User viewer, User candidate, BusinessProfile business) {
        int score = 0;
        String category = business == null ? candidate.getBusinessCategory() : business.getCategory();
        if (category != null && category.equalsIgnoreCase(viewer.getBusinessCategory())) score += 4;
        if (viewer.getChapter() != null && candidate.getChapter() != null && viewer.getChapter().getId().equals(candidate.getChapter().getId())) score += 2;
        if (business != null && business.getCity() != null && viewer.getLocation() != null && business.getCity().equalsIgnoreCase(viewer.getLocation())) score++;
        return score;
    }

    private void safeNotify(User user, String title, String message, String url) {
        try { notificationService.notify(user, title, message, url); }
        catch (RuntimeException ex) { org.slf4j.LoggerFactory.getLogger(ConnectionController.class).warn("Connection notification delivery failed for user {}", user.getId(), ex); }
    }

    private String cleanMessage(String value) { if (value == null || value.isBlank()) return null; return value.trim(); }
    private String clean(String value) { return value == null ? "" : value.trim().toLowerCase(Locale.ROOT); }
    private String safe(String value) { return value == null ? "" : value; }
    private <T> PageResponse<T> pageResponse(Page<?> page, List<T> content) {
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    public record SendRequest(@Size(max = 500) String message) {}
    public record MemberCard(Long id, String fullName, String profileImage, String businessName, String profession, String category,
                             String services, String city, String state, String country, String chapterName, String connectionStatus,
                             String logoUrl) {}
    public record MemberProfile(MemberCard member, String description, String services, String lookingFor,
                                String website, Integer foundedYear, String teamSize, boolean verified) {}
    public record ConnectionDto(Long id, MemberCard sender, MemberCard receiver, String status, String message,
                                LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime respondedAt) {}
    public record Dashboard(long totalConnections, long newConnections, long receivedPending, long sentPending,
                            List<MemberCard> recentConnections, List<MemberCard> suggestions) {}
    public record AdminOverview(long activeConnections, long pendingRequests, long rejectedRequests, long withdrawnRequests) {}
}
