package com.networkers.business;

import com.networkers.common.ApiResponse;
import com.networkers.security.CurrentUser;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.networkers.media.CloudinaryImageService;
import java.io.IOException;

import java.util.List;

@RestController
@RequestMapping("/api/business")
public class BusinessController {
    private final BusinessProfileRepository businesses;
    private final CloudinaryImageService media;

    public BusinessController(BusinessProfileRepository businesses, CloudinaryImageService media) {
        this.businesses = businesses;
        this.media = media;
    }

    @PostMapping("/profile")
    public ApiResponse<BusinessProfile> create(@Valid @RequestBody BusinessProfileRequest request) {
        if (businesses.existsByUser(CurrentUser.get())) throw new IllegalStateException("Business profile already exists");
        BusinessProfile profile = apply(new BusinessProfile(), request);
        profile.setUser(CurrentUser.get());
        return ApiResponse.ok("Profile created", businesses.save(profile));
    }

    @PutMapping("/profile")
    public ApiResponse<BusinessProfile> update(@Valid @RequestBody BusinessProfileRequest request) {
        BusinessProfile profile = businesses.findByUser(CurrentUser.get()).orElseThrow(() -> new EntityNotFoundException("Business profile not found"));
        return ApiResponse.ok("Profile updated", businesses.save(apply(profile, request)));
    }

    @GetMapping("/my-profile")
    public ApiResponse<BusinessProfile> myProfile() {
        return ApiResponse.ok("My profile", businesses.findByUser(CurrentUser.get()).orElse(null));
    }

    @PutMapping(value="/profile/logo", consumes="multipart/form-data")
    public ApiResponse<BusinessProfile> uploadLogo(@RequestPart MultipartFile file) throws IOException {
        if (file == null || file.isEmpty() || file.getContentType() == null || !file.getContentType().startsWith("image/")) throw new IllegalArgumentException("Choose a valid image file");
        BusinessProfile profile = businesses.findByUser(CurrentUser.get()).orElseThrow(() -> new EntityNotFoundException("Create your business profile before uploading its image"));
        profile.setLogoUrl(media.uploadBusinessLogo(file, profile.getId()));
        return ApiResponse.ok("Business image uploaded", businesses.save(profile));
    }

    @GetMapping("/all")
    public ApiResponse<List<BusinessProfile>> all() {
        return ApiResponse.ok("Businesses", businesses.findActiveProfiles());
    }

    @GetMapping("/{id}")
    public ApiResponse<BusinessProfile> byId(@PathVariable Long id) {
        return ApiResponse.ok("Business", businesses.findById(id).orElseThrow(() -> new EntityNotFoundException("Business not found")));
    }

    @GetMapping("/search")
    public ApiResponse<List<BusinessProfile>> search(@RequestParam(required = false) String keyword,
                                                     @RequestParam(required = false) String city,
                                                     @RequestParam(required = false) String category) {
        return ApiResponse.ok("Search results", businesses.search(blankToNull(keyword), blankToNull(city), blankToNull(category)));
    }

    static BusinessProfile apply(BusinessProfile p, BusinessProfileRequest r) {
        p.setBusinessName(r.businessName());
        p.setOwnerName(r.ownerName());
        p.setCategory(r.category());
        p.setDescription(r.description());
        p.setServices(r.services());
        p.setLookingFor(r.lookingFor());
        p.setCity(r.city());
        p.setState(r.state());
        p.setAddress(r.address());
        p.setWebsite(normalizeWebsite(r.website()));
        p.setBusinessEmail(r.businessEmail());
        p.setBusinessPhone(r.businessPhone());
        p.setFoundedYear(r.foundedYear());
        p.setTeamSize(r.teamSize());
        p.setLogoUrl(r.logoUrl());
        return p;
    }

    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value; }

    private static String normalizeWebsite(String value) {
        if (value == null || value.isBlank()) return value;
        String website = value.trim();
        return website.matches("(?i)^https?://.*") ? website : "https://" + website;
    }

    public record BusinessProfileRequest(@NotBlank String businessName, String ownerName, String category, String description,
                                         String services, String lookingFor, String city, String state, String address,
                                         String website, String businessEmail, String businessPhone, Integer foundedYear,
                                         String teamSize, String logoUrl) {}
}
