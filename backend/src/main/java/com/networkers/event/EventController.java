package com.networkers.event;

import com.networkers.chapter.Chapter;
import com.networkers.chapter.ChapterRepository;
import com.networkers.common.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import com.networkers.notification.NotificationService;
import com.networkers.user.UserRepository;
import com.networkers.user.Role;
import com.networkers.user.User;
import com.networkers.security.CurrentUser;
import com.networkers.mail.AccountMailService;
import java.util.Base64;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@RestController
public class EventController {
    private final EventRepository events;
    private final EventImageRepository images;
    private final ChapterRepository chapters;
    private final UserRepository users;
    private final NotificationService notificationService;
    private final AccountMailService mail;
    private final EventRsvpRepository rsvps;

    public EventController(EventRepository events, EventImageRepository images, ChapterRepository chapters, UserRepository users, NotificationService notificationService, AccountMailService mail, EventRsvpRepository rsvps) {
        this.events = events; this.images = images; this.chapters = chapters; this.users = users; this.notificationService = notificationService; this.mail = mail; this.rsvps = rsvps;
    }

    @GetMapping("/api/events")
    @Transactional
    public ApiResponse<List<Event>> all() { completePastEvents(); return ApiResponse.ok("Events", events.findAllByOrderByEventDateDesc()); }

    @GetMapping("/api/events/upcoming")
    @Transactional
    public ApiResponse<List<Event>> upcoming() { LocalDate today = today(); completePastEvents(); return ApiResponse.ok("Upcoming events", events.findByEventTypeAndEventDateGreaterThanEqualOrderByEventDateAsc(EventType.UPCOMING, today)); }

    @GetMapping("/api/events/{id}")
    public ApiResponse<Event> one(@PathVariable Long id) { return ApiResponse.ok("Event", find(id)); }

    @GetMapping("/api/events/rsvps/mine") public ApiResponse<java.util.Map<Long,String>> myRsvps(){User user=CurrentUser.get();java.util.Map<Long,String> result=new java.util.HashMap<>();events.findAll().forEach(e->rsvps.findByEventAndUser(e,user).ifPresent(r->result.put(e.getId(),r.getStatus().name())));return ApiResponse.ok("My event responses",result);}
    @PutMapping("/api/events/{id}/rsvp") public ApiResponse<RsvpView> rsvp(@PathVariable Long id,@RequestBody RsvpRequest request){if(request.status()!=EventRsvpStatus.GOING&&request.status()!=EventRsvpStatus.NOT_GOING)throw new IllegalArgumentException("Choose Attending or Not Attending");Event event=find(id);if(event.getEventDate()!=null&&event.getEventDate().isBefore(LocalDate.now()))throw new IllegalStateException("This event has already started");User user=CurrentUser.get();if(event.getChapter()!=null&&(user.getChapter()==null||!event.getChapter().getId().equals(user.getChapter().getId())))throw new SecurityException("This event is for another chapter");EventRsvp r=rsvps.findByEventAndUser(event,user).orElseGet(EventRsvp::new);r.setEvent(event);r.setUser(user);r.setStatus(request.status());return ApiResponse.ok("Event response saved",view(rsvps.save(r)));}
    @GetMapping("/api/admin/events/{id}/rsvps") public ApiResponse<List<RsvpView>> eventRsvps(@PathVariable Long id){Event event=find(id);java.util.Map<Long,EventRsvp> responses=new java.util.HashMap<>();rsvps.findByEventOrderByUserFullNameAsc(event).forEach(r->responses.put(r.getUser().getId(),r));return ApiResponse.ok("Event attendance",eligibleMembers(event).stream().map(u->{EventRsvp r=responses.get(u.getId());return r==null?view(u,EventRsvpStatus.PENDING):view(r);}).toList());}
    @PutMapping("/api/admin/events/{eventId}/rsvps/{userId}") public ApiResponse<RsvpView> confirmAttendance(@PathVariable Long eventId,@PathVariable Long userId,@RequestBody RsvpRequest request){Event event=find(eventId);User user=users.findById(userId).orElseThrow(()->new EntityNotFoundException("User not found"));EventRsvp existing=rsvps.findByEventAndUser(event,user).orElse(null);if(request.status()==EventRsvpStatus.PENDING){if(existing!=null)rsvps.delete(existing);return ApiResponse.ok("Attendance reset to pending",view(user,EventRsvpStatus.PENDING));}EventRsvp r=existing==null?new EventRsvp():existing;r.setEvent(event);r.setUser(user);r.setStatus(request.status());return ApiResponse.ok("Attendance updated",view(rsvps.save(r)));}

    @PostMapping("/api/admin/events")
    @Transactional
    public ApiResponse<Event> create(@RequestBody EventRequest request) {
        if (request.eventDate() == null) throw new IllegalArgumentException("Event date is required");
        if (request.eventDate().isBefore(today())) throw new IllegalArgumentException("Past-date events cannot be created");
        Event event = new Event();
        apply(event, request);
        Event saved = events.save(event);
        var recipients = eligibleMembers(saved);
        String chapterName = saved.getChapter() == null ? "All Chapters" : saved.getChapter().getChapterName();
        recipients.stream().filter(user -> user.isEnabled()).forEach(user -> {
            notificationService.notify(user, "New event: " + saved.getTitle(), "You are invited to " + saved.getTitle() + " on " + saved.getEventDate() + (saved.getEventTime() == null ? "" : " at " + saved.getEventTime()) + ". Venue: " + (saved.getLocation() == null ? "To be announced" : saved.getLocation()) + ". Chapter: " + chapterName + ".");
            try { mail.sendEventInvitation(user.getFullName(), user.getEmail(), saved.getTitle(), saved.getEventDate().toString(), saved.getEventTime() == null ? "To be announced" : saved.getEventTime().toString(), saved.getLocation(), chapterName, saved.getDescription()); } catch (Exception ignored) {}
        });
        return ApiResponse.ok("Event created and members notified", saved);
    }

    @PutMapping("/api/admin/events/{id}")
    public ApiResponse<Event> update(@PathVariable Long id, @RequestBody EventRequest request) {
        if (request.eventDate() == null) throw new IllegalArgumentException("Event date is required");
        if (request.eventDate().isBefore(today())) throw new IllegalArgumentException("Event date cannot be in the past");
        Event event = find(id);
        apply(event, request);
        return ApiResponse.ok("Event updated", events.save(event));
    }

    @DeleteMapping("/api/admin/events/{id}")
    @Transactional
    public ApiResponse<?> delete(@PathVariable Long id) {
        Event event=find(id);rsvps.deleteByEvent(event);events.delete(event);
        return ApiResponse.ok("Event deleted", true);
    }

    @PostMapping("/api/admin/events/{id}/images")
    public ApiResponse<Event> addImage(@PathVariable Long id, @RequestBody ImageRequest request) {
        Event event = find(id);
        EventImage image = new EventImage();
        image.setEvent(event);
        image.setImageUrl(request.imageUrl());
        images.save(image);
        return ApiResponse.ok("Image uploaded", find(id));
    }

    @PostMapping("/api/admin/events/{id}/image-upload")
    public ApiResponse<Event> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws java.io.IOException {
        if (file.isEmpty() || file.getContentType() == null || !file.getContentType().startsWith("image/")) throw new IllegalArgumentException("Choose a valid image file");
        if (file.getSize() > 10 * 1024 * 1024) throw new IllegalArgumentException("Image must be smaller than 10 MB");
        EventImage image = new EventImage(); image.setEvent(find(id)); image.setImageUrl("data:" + file.getContentType() + ";base64," + Base64.getEncoder().encodeToString(file.getBytes())); images.save(image);
        return ApiResponse.ok("Event image uploaded", find(id));
    }

    private Event find(Long id) {
        return events.findById(id).orElseThrow(() -> new EntityNotFoundException("Event not found"));
    }

    private LocalDate today() { return LocalDate.now(ZoneId.of("Asia/Kolkata")); }

    private void completePastEvents() {
        List<Event> pastEvents = events.findByEventTypeAndEventDateBefore(EventType.UPCOMING, today());
        pastEvents.forEach(event -> event.setEventType(EventType.COMPLETED));
        if (!pastEvents.isEmpty()) events.saveAll(pastEvents);
    }

    private List<User> eligibleMembers(Event event){java.util.stream.Stream<User> stream=event.getChapter()==null?java.util.stream.Stream.concat(users.findByRole(Role.USER).stream(),users.findByRole(Role.BUSINESS_USER).stream()):users.findByChapterAndDeletedFalseOrderByFullNameAsc(event.getChapter()).stream();return stream.filter(User::isEnabled).filter(u->u.getRole()==Role.USER||u.getRole()==Role.BUSINESS_USER).distinct().sorted(java.util.Comparator.comparing(User::getFullName,String.CASE_INSENSITIVE_ORDER)).toList();}

    private void apply(Event event, EventRequest request) {
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setEventDate(request.eventDate());
        event.setEventTime(request.eventTime());
        event.setLocation(request.location());
        event.setEventType(event.getEventDate() != null && event.getEventDate().isBefore(today()) ? EventType.COMPLETED : EventType.UPCOMING);
        Chapter chapter = request.chapterId() == null ? null : chapters.findById(request.chapterId()).orElseThrow(() -> new EntityNotFoundException("Chapter not found"));
        event.setChapter(chapter);
    }

    public record EventRequest(String title, String description, LocalDate eventDate, LocalTime eventTime,
                               String location, Long chapterId, EventType eventType) {}
    public record ImageRequest(String imageUrl) {}
    public record RsvpRequest(EventRsvpStatus status) {}
    public record RsvpView(Long id,Long userId,String name,String avatar,String businessName,EventRsvpStatus status) {}
    private RsvpView view(EventRsvp r){return new RsvpView(r.getId(),r.getUser().getId(),r.getUser().getFullName(),r.getUser().getProfileImage(),r.getUser().getBusinessName(),r.getStatus());}
    private RsvpView view(User u,EventRsvpStatus status){return new RsvpView(null,u.getId(),u.getFullName(),u.getProfileImage(),u.getBusinessName(),status);}
}
