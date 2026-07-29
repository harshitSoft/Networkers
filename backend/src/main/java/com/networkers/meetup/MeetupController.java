package com.networkers.meetup;

import com.networkers.common.ApiResponse;
import com.networkers.notification.NotificationService;
import com.networkers.security.CurrentUser;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.time.ZoneId;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/meetups")
public class MeetupController {
    private final MeetupRepository meetups;
    private final MeetupAttendeeRepository attendees;
    private final NotificationService notificationService;
    public MeetupController(MeetupRepository meetups, MeetupAttendeeRepository attendees, NotificationService notificationService) {
        this.meetups = meetups; this.attendees = attendees; this.notificationService = notificationService;
    }
    @PostMapping("/admin") public ApiResponse<Meetup> create(@RequestBody MeetupRequest r) {
        if (r.date() == null) throw new IllegalArgumentException("Meetup date is required");
        if (r.date().isBefore(today())) throw new IllegalArgumentException("Past-date meetups cannot be created");
        Meetup m = apply(new Meetup(), r); m.setCreatedBy(CurrentUser.get());
        return ApiResponse.ok("Meetup created", meetups.save(m));
    }
    @PutMapping("/admin/{id}") public ApiResponse<Meetup> update(@PathVariable Long id, @RequestBody MeetupRequest r) {
        if (r.date() == null) throw new IllegalArgumentException("Meetup date is required");
        if (r.date().isBefore(today())) throw new IllegalArgumentException("Meetup date cannot be in the past");
        return ApiResponse.ok("Meetup updated", meetups.save(apply(get(id), r)));
    }
    @DeleteMapping("/admin/{id}") public ApiResponse<Void> delete(@PathVariable Long id) { meetups.delete(get(id)); return ApiResponse.ok("Meetup deleted", null); }
    @GetMapping @Transactional public ApiResponse<List<Meetup>> all() { completePastMeetups(); return ApiResponse.ok("Meetups", meetups.findAllByOrderByDateAscStartTimeAsc()); }
    @GetMapping("/{id}") public ApiResponse<Meetup> one(@PathVariable Long id) { return ApiResponse.ok("Meetup", get(id)); }
    @PostMapping("/{id}/join") public ApiResponse<MeetupAttendee> join(@PathVariable Long id) {
        Meetup m = get(id);
        MeetupAttendee a = attendees.findByMeetupAndUser(m, CurrentUser.get()).orElseGet(MeetupAttendee::new);
        a.setMeetup(m); a.setUser(CurrentUser.get()); a.setStatus(AttendeeStatus.JOINED);
        notificationService.notify(CurrentUser.get(), "Meetup joined", "You joined " + m.getTitle());
        return ApiResponse.ok("Meetup joined", attendees.save(a));
    }
    @PutMapping("/{id}/cancel-join") public ApiResponse<MeetupAttendee> cancel(@PathVariable Long id) {
        MeetupAttendee a = attendees.findByMeetupAndUser(get(id), CurrentUser.get()).orElseThrow(() -> new EntityNotFoundException("Join record not found"));
        a.setStatus(AttendeeStatus.CANCELLED);
        return ApiResponse.ok("Meetup cancelled", attendees.save(a));
    }
    @GetMapping("/{id}/attendees") public ApiResponse<List<MeetupAttendee>> attendees(@PathVariable Long id) { return ApiResponse.ok("Attendees", attendees.findByMeetup(get(id))); }
    @GetMapping("/my") public ApiResponse<List<MeetupAttendee>> my() { return ApiResponse.ok("My meetups", attendees.findByUserOrderByJoinedAtDesc(CurrentUser.get())); }
    private Meetup get(Long id) { return meetups.findById(id).orElseThrow(() -> new EntityNotFoundException("Meetup not found")); }
    private Meetup apply(Meetup m, MeetupRequest r) {
        m.setTitle(r.title()); m.setDescription(r.description()); m.setDate(r.date()); m.setStartTime(r.startTime());
        m.setEndTime(r.endTime()); m.setVenue(r.venue()); m.setCity(r.city()); m.setMaxAttendees(r.maxAttendees());
        m.setAgenda(r.agenda()); m.setStatus(m.getDate() != null && m.getDate().isBefore(today()) ? MeetupStatus.COMPLETED : MeetupStatus.UPCOMING); return m;
    }
    private LocalDate today() { return LocalDate.now(ZoneId.of("Asia/Kolkata")); }
    private void completePastMeetups() {
        List<Meetup> past = meetups.findByStatusAndDateBefore(MeetupStatus.UPCOMING, today());
        past.forEach(meetup -> meetup.setStatus(MeetupStatus.COMPLETED));
        if (!past.isEmpty()) meetups.saveAll(past);
    }
    public record MeetupRequest(@NotBlank String title, String description, LocalDate date, LocalTime startTime, LocalTime endTime,
                                String venue, String city, Integer maxAttendees, String agenda, MeetupStatus status) {}
}
