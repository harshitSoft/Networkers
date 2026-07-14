package com.networkers.meeting;

import com.networkers.common.ApiResponse;
import com.networkers.meetup.MeetupRepository;
import com.networkers.notification.NotificationService;
import com.networkers.security.CurrentUser;
import com.networkers.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {
    private final MeetingRequestRepository meetings;
    private final UserRepository users;
    private final MeetupRepository meetups;
    private final NotificationService notificationService;
    public MeetingController(MeetingRequestRepository meetings, UserRepository users, MeetupRepository meetups, NotificationService notificationService) {
        this.meetings = meetings; this.users = users; this.meetups = meetups; this.notificationService = notificationService;
    }
    @PostMapping("/request") public ApiResponse<MeetingRequest> request(@RequestBody MeetingCreateRequest r) {
        MeetingRequest m = new MeetingRequest(); m.setRequester(CurrentUser.get());
        m.setReceiver(users.findById(r.receiverId()).orElseThrow(() -> new EntityNotFoundException("Receiver not found")));
        if (r.meetupId() != null) m.setMeetup(meetups.findById(r.meetupId()).orElseThrow(() -> new EntityNotFoundException("Meetup not found")));
        m.setPurpose(r.purpose()); m.setMeetingDate(r.meetingDate()); m.setMeetingTime(r.meetingTime());
        notificationService.notify(m.getReceiver(), "Meeting request", CurrentUser.get().getFullName() + " requested a meeting.");
        return ApiResponse.ok("Meeting requested", meetings.save(m));
    }
    @PutMapping("/{id}/accept") public ApiResponse<MeetingRequest> accept(@PathVariable Long id) { return change(id, MeetingStatus.ACCEPTED, true); }
    @PutMapping("/{id}/reject") public ApiResponse<MeetingRequest> reject(@PathVariable Long id) { return change(id, MeetingStatus.REJECTED, true); }
    @PutMapping("/{id}/cancel") public ApiResponse<MeetingRequest> cancel(@PathVariable Long id) { return change(id, MeetingStatus.CANCELLED, false); }
    @GetMapping("/received") public ApiResponse<List<MeetingRequest>> received() { return ApiResponse.ok("Received meetings", meetings.findByReceiverOrderByCreatedAtDesc(CurrentUser.get())); }
    @GetMapping("/sent") public ApiResponse<List<MeetingRequest>> sent() { return ApiResponse.ok("Sent meetings", meetings.findByRequesterOrderByCreatedAtDesc(CurrentUser.get())); }
    private ApiResponse<MeetingRequest> change(Long id, MeetingStatus status, boolean receiverOnly) {
        MeetingRequest m = meetings.findById(id).orElseThrow(() -> new EntityNotFoundException("Meeting not found"));
        Long uid = CurrentUser.get().getId();
        if (receiverOnly && !m.getReceiver().getId().equals(uid)) throw new IllegalStateException("Only receiver can respond");
        if (!receiverOnly && !m.getRequester().getId().equals(uid)) throw new IllegalStateException("Only requester can cancel");
        m.setStatus(status);
        notificationService.notify(m.getRequester(), "Meeting " + status.name().toLowerCase(), "Your meeting request was " + status.name().toLowerCase());
        return ApiResponse.ok("Meeting updated", meetings.save(m));
    }
    public record MeetingCreateRequest(Long receiverId, Long meetupId, String purpose, LocalDate meetingDate, LocalTime meetingTime) {}
}
