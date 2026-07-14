package com.networkers.auth;

import com.networkers.common.ApiResponse;
import com.networkers.security.CurrentUser;
import com.networkers.security.JwtService;
import com.networkers.user.Role;
import com.networkers.user.User;
import com.networkers.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(UserRepository users, PasswordEncoder encoder, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.users = users;
        this.encoder = encoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ApiResponse<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        throw new IllegalStateException("Public registration is disabled. Contact admin to join Networkers.");
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = users.findByEmail(request.email()).orElseThrow();
        if (!user.isEnabled()) throw new IllegalStateException("Account is blocked");
        return ApiResponse.ok("Login successful", authPayload(user));
    }

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> me() {
        return ApiResponse.ok("Current user", userDto(CurrentUser.get()));
    }

    private Map<String, Object> authPayload(User user) {
        return Map.of("token", jwtService.generate(user.getEmail()), "user", userDto(user));
    }

    public static Map<String, Object> userDto(User user) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", user.getId());
        dto.put("fullName", user.getFullName());
        dto.put("email", user.getEmail());
        dto.put("mobile", user.getMobile() == null ? "" : user.getMobile());
        dto.put("role", user.getRole().name());
        dto.put("businessName", user.getBusinessName() == null ? "" : user.getBusinessName());
        dto.put("businessCategory", user.getBusinessCategory() == null ? "" : user.getBusinessCategory());
        dto.put("services", user.getServices() == null ? "" : user.getServices());
        dto.put("location", user.getLocation() == null ? "" : user.getLocation());
        dto.put("chapterName", user.getChapter() == null ? "" : user.getChapter().getChapterName());
        dto.put("chapterId", user.getChapter() == null ? "" : user.getChapter().getId());
        dto.put("subscriptionPlan", user.getSubscriptionPlan() == null ? "" : user.getSubscriptionPlan());
        dto.put("subscriptionStartDate", user.getSubscriptionStartDate() == null ? "" : user.getSubscriptionStartDate().toString());
        dto.put("subscriptionEndDate", user.getSubscriptionEndDate() == null ? "" : user.getSubscriptionEndDate().toString());
        dto.put("enabled", user.isEnabled());
        return dto;
    }

    public record RegisterRequest(@NotBlank String fullName, @Email String email, String mobile, @NotBlank String password) {}
    public record LoginRequest(@Email String email, @NotBlank String password) {}
}
