package com.networkers.chapter;

import com.networkers.common.ApiResponse;
import com.networkers.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;

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
        if (request.chapterNumber() == null) throw new IllegalArgumentException("Chapter number is required");
        Chapter chapter = chapters.findByChapterNumber(request.chapterNumber()).orElseGet(Chapter::new);
        if (chapter.getId() != null && chapter.isActive()) throw new IllegalArgumentException("Chapter number " + request.chapterNumber() + " already exists");
        apply(chapter, request);
        return ApiResponse.ok(chapter.getId() == null ? "Chapter created" : "Chapter reactivated", dto(chapters.save(chapter)));
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

    @PostMapping("/api/admin/chapters/{id}/banner")
    public ApiResponse<Map<String, Object>> uploadBanner(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws java.io.IOException {
        if (file.isEmpty() || file.getContentType() == null || !file.getContentType().startsWith("image/")) throw new IllegalArgumentException("Choose a valid image file");
        if (file.getSize() > 10 * 1024 * 1024) throw new IllegalArgumentException("Image must be smaller than 10 MB");
        Chapter chapter = find(id); chapter.setBannerImage("data:" + file.getContentType() + ";base64," + Base64.getEncoder().encodeToString(file.getBytes()));
        return ApiResponse.ok("Chapter banner uploaded", dto(chapters.save(chapter)));
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
        if (request.chapterNumber() == null) throw new IllegalArgumentException("Chapter number is required");
        if (request.chapterName() == null || request.chapterName().isBlank()) throw new IllegalArgumentException("Chapter name is required");
        chapter.setChapterNumber(request.chapterNumber());
        chapter.setChapterName(request.chapterName().trim());
        chapter.setDescription(blankToNull(request.description()));
        chapter.setActive(request.active() == null || request.active());
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private Map<String, Object> dto(Chapter chapter) {
        return Map.of(
                "id", chapter.getId(),
                "chapterNumber", chapter.getChapterNumber() == null ? 0 : chapter.getChapterNumber(),
                "chapterName", chapter.getChapterName() == null ? "" : chapter.getChapterName(),
                "description", chapter.getDescription() == null ? "" : chapter.getDescription(),
                "bannerImage", chapter.getBannerImage() == null ? "" : chapter.getBannerImage(),
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
                "profileImage", user.getProfileImage() == null ? "" : user.getProfileImage(),
                "services", user.getServices() == null ? "" : user.getServices(),
                "location", user.getLocation() == null ? "" : user.getLocation());
    }

    public record ChapterRequest(Integer chapterNumber, String chapterName, String description, Boolean active) {}
}
