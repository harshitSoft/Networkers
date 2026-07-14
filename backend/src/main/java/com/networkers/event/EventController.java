package com.networkers.event;

import com.networkers.chapter.Chapter;
import com.networkers.chapter.ChapterRepository;
import com.networkers.common.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
public class EventController {
    private final EventRepository events;
    private final EventImageRepository images;
    private final ChapterRepository chapters;

    public EventController(EventRepository events, EventImageRepository images, ChapterRepository chapters) {
        this.events = events;
        this.images = images;
        this.chapters = chapters;
    }

    @GetMapping("/api/events")
    public ApiResponse<List<Event>> all() { return ApiResponse.ok("Events", events.findAllByOrderByEventDateDesc()); }

    @GetMapping("/api/events/upcoming")
    public ApiResponse<List<Event>> upcoming() { return ApiResponse.ok("Upcoming events", events.findByEventTypeOrderByEventDateAsc(EventType.UPCOMING)); }

    @GetMapping("/api/events/{id}")
    public ApiResponse<Event> one(@PathVariable Long id) { return ApiResponse.ok("Event", find(id)); }

    @PostMapping("/api/admin/events")
    public ApiResponse<Event> create(@RequestBody EventRequest request) {
        Event event = new Event();
        apply(event, request);
        return ApiResponse.ok("Event created", events.save(event));
    }

    @PutMapping("/api/admin/events/{id}")
    public ApiResponse<Event> update(@PathVariable Long id, @RequestBody EventRequest request) {
        Event event = find(id);
        apply(event, request);
        return ApiResponse.ok("Event updated", events.save(event));
    }

    @DeleteMapping("/api/admin/events/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        events.delete(find(id));
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

    private Event find(Long id) {
        return events.findById(id).orElseThrow(() -> new EntityNotFoundException("Event not found"));
    }

    private void apply(Event event, EventRequest request) {
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setEventDate(request.eventDate());
        event.setEventTime(request.eventTime());
        event.setLocation(request.location());
        event.setEventType(request.eventType() == null ? EventType.UPCOMING : request.eventType());
        Chapter chapter = request.chapterId() == null ? null : chapters.findById(request.chapterId()).orElseThrow(() -> new EntityNotFoundException("Chapter not found"));
        event.setChapter(chapter);
    }

    public record EventRequest(String title, String description, LocalDate eventDate, LocalTime eventTime,
                               String location, Long chapterId, EventType eventType) {}
    public record ImageRequest(String imageUrl) {}
}
