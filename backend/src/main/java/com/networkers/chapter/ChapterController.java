package com.networkers.chapter;

import com.networkers.common.ApiResponse;
import com.networkers.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
public class ChapterController {
    private final ChapterRepository chapters;
    private final UserRepository users;

    public ChapterController(ChapterRepository chapters, UserRepository users) {
        this.chapters = chapters;
        this.users = users;
    }

    @GetMapping("/api/chapters")
    public ApiResponse<List<Map<String, Object>>> publicChapters() {
        return ApiResponse.ok("Chapters", chapters.findByActiveTrueOrderByChapterNumberAsc().stream().map(this::dto).toList());
    }

    @GetMapping("/api/chapters/{id}")
    public ApiResponse<Map<String, Object>> publicChapter(@PathVariable Long id) {
        return ApiResponse.ok("Chapter", dto(find(id)));
    }

    @PostMapping("/api/admin/chapters")
    public ApiResponse<Map<String, Object>> create(@RequestBody ChapterRequest request) {
        Chapter chapter = new Chapter();
        apply(chapter, request);
        return ApiResponse.ok("Chapter created", dto(chapters.save(chapter)));
    }

    @PutMapping("/api/admin/chapters/{id}")
    public ApiResponse<Map<String, Object>> update(@PathVariable Long id, @RequestBody ChapterRequest request) {
        Chapter chapter = find(id);
        apply(chapter, request);
        return ApiResponse.ok("Chapter updated", dto(chapters.save(chapter)));
    }

    @DeleteMapping("/api/admin/chapters/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        Chapter chapter = find(id);
        chapter.setActive(false);
        return ApiResponse.ok("Chapter deactivated", dto(chapters.save(chapter)));
    }

    @GetMapping("/api/admin/chapters/{id}/members")
    public ApiResponse<?> members(@PathVariable Long id) {
        return ApiResponse.ok("Chapter members", users.findByChapterAndDeletedFalseOrderByFullNameAsc(find(id)));
    }

    @GetMapping("/api/user/chapters/{id}/members")
    public ApiResponse<?> userMembers(@PathVariable Long id) {
        return ApiResponse.ok("Chapter members", users.findByChapterAndDeletedFalseOrderByFullNameAsc(find(id)).stream().map(this::memberDto).toList());
    }

    private Chapter find(Long id) {
        return chapters.findById(id).orElseThrow(() -> new EntityNotFoundException("Chapter not found"));
    }

    private void apply(Chapter chapter, ChapterRequest request) {
        chapter.setChapterNumber(request.chapterNumber());
        chapter.setChapterName(request.chapterName());
        chapter.setDescription(request.description());
        chapter.setLocation(request.location());
        chapter.setSubscriptionName(request.subscriptionName());
        chapter.setSubscriptionAmount(request.subscriptionAmount());
        chapter.setSubscriptionDurationMonths(request.subscriptionDurationMonths());
        chapter.setActive(request.active() == null || request.active());
    }

    private Map<String, Object> dto(Chapter chapter) {
        return Map.of(
                "id", chapter.getId(),
                "chapterNumber", chapter.getChapterNumber() == null ? 0 : chapter.getChapterNumber(),
                "chapterName", chapter.getChapterName() == null ? "" : chapter.getChapterName(),
                "description", chapter.getDescription() == null ? "" : chapter.getDescription(),
                "location", chapter.getLocation() == null ? "" : chapter.getLocation(),
                "subscriptionName", chapter.getSubscriptionName() == null ? "" : chapter.getSubscriptionName(),
                "subscriptionAmount", chapter.getSubscriptionAmount() == null ? BigDecimal.ZERO : chapter.getSubscriptionAmount(),
                "subscriptionDurationMonths", chapter.getSubscriptionDurationMonths() == null ? 0 : chapter.getSubscriptionDurationMonths(),
                "active", chapter.isActive(),
                "memberCount", users.countByChapterAndDeletedFalse(chapter));
    }

    private Map<String, Object> memberDto(com.networkers.user.User user) {
        return Map.of(
                "id", user.getId(),
                "fullName", user.getFullName() == null ? "" : user.getFullName(),
                "email", user.getEmail() == null ? "" : user.getEmail(),
                "mobile", user.getMobile() == null ? "" : user.getMobile(),
                "businessName", user.getBusinessName() == null ? "" : user.getBusinessName(),
                "businessCategory", user.getBusinessCategory() == null ? "" : user.getBusinessCategory(),
                "services", user.getServices() == null ? "" : user.getServices(),
                "location", user.getLocation() == null ? "" : user.getLocation());
    }

    public record ChapterRequest(Integer chapterNumber, String chapterName, String description, String location,
                                 String subscriptionName, BigDecimal subscriptionAmount,
                                 Integer subscriptionDurationMonths, Boolean active) {}
}
