package com.networkers.auth;

import com.networkers.common.ApiResponse;
import com.networkers.security.CurrentUser;
import com.networkers.security.JwtService;
import com.networkers.user.Role;
import com.networkers.user.User;
import com.networkers.user.UserRepository;
import com.networkers.media.CloudinaryImageService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.LinkedHashMap;
import java.util.Map;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CloudinaryImageService images;
    private final PasswordOtpService passwordOtps;

    public AuthController(UserRepository users, PasswordEncoder encoder, AuthenticationManager authenticationManager, JwtService jwtService, CloudinaryImageService images, PasswordOtpService passwordOtps) {
        this.users = users;
        this.encoder = encoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.images = images;
        this.passwordOtps = passwordOtps;
    }

    @PostMapping("/register")
    public ApiResponse<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        throw new IllegalStateException("Public registration is disabled. Contact admin to join Networkers.");
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        User user = users.findByEmail(email).orElseThrow();
        if (!user.isEnabled()) throw new IllegalStateException("Account is blocked");
        return ApiResponse.ok("Login successful", authPayload(user));
    }

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> me() {
        return ApiResponse.ok("Current user", userDto(CurrentUser.get()));
    }

    @GetMapping("/birthdays/today")
    public ApiResponse<java.util.List<Map<String, Object>>> todaysBirthdays() {
        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Kolkata"));
        var result = users.findAll().stream().filter(User::isEnabled).filter(u -> !u.isDeleted())
                .filter(u -> u.getDateOfBirth() != null && u.getDateOfBirth().getMonthValue() == today.getMonthValue() && u.getDateOfBirth().getDayOfMonth() == today.getDayOfMonth())
                .map(u -> Map.<String,Object>of("id", u.getId(), "fullName", u.getFullName(), "profileImage", u.getProfileImage() == null ? "" : u.getProfileImage()))
                .toList();
        return ApiResponse.ok("Today's birthdays", result);
    }

    @PutMapping("/profile")
    public ApiResponse<Map<String, Object>> updateProfile(@Valid @RequestBody ProfileRequest request) {
        User user = CurrentUser.get();
        user.setFullName(request.fullName());
        user.setMobile(request.mobile());
        user.setLocation(request.location());
        return ApiResponse.ok("Personal profile updated", userDto(users.save(user)));
    }

    @PutMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = CurrentUser.get();
        if (!encoder.matches(request.currentPassword(), user.getPassword())) throw new IllegalArgumentException("Current password is incorrect");
        if (request.newPassword().length() < 8) throw new IllegalArgumentException("New password must be at least 8 characters");
        if (request.currentPassword().equals(request.newPassword())) throw new IllegalArgumentException("New password must be different");
        user.setPassword(encoder.encode(request.newPassword())); users.save(user);
        return ApiResponse.ok("Password changed successfully", null);
    }

    @PostMapping("/password/change/request")
    public ApiResponse<Void> requestPasswordChangeOtp() {
        passwordOtps.issue(CurrentUser.get(), PasswordOtpPurpose.CHANGE_PASSWORD);
        return ApiResponse.ok("OTP sent to your registered email", null);
    }

    @PutMapping("/password/change/confirm")
    public ApiResponse<Void> confirmPasswordChange(@Valid @RequestBody ConfirmPasswordOtpRequest request) {
        User user = CurrentUser.get();
        validateNewPassword(user, request.newPassword());
        passwordOtps.verify(user, PasswordOtpPurpose.CHANGE_PASSWORD, request.otp());
        user.setPassword(encoder.encode(request.newPassword())); users.save(user);
        return ApiResponse.ok("Password changed successfully", null);
    }

    @PostMapping("/password/forgot/request")
    public ApiResponse<Void> requestForgotPasswordOtp(@Valid @RequestBody ForgotPasswordRequest request) {
        users.findByEmail(request.email().trim()).ifPresent(user -> passwordOtps.issue(user, PasswordOtpPurpose.FORGOT_PASSWORD));
        return ApiResponse.ok("If the email is registered, an OTP has been sent", null);
    }

    @PostMapping("/password/forgot/reset")
    public ApiResponse<Void> resetForgottenPassword(@Valid @RequestBody ResetPasswordRequest request) {
        User user = users.findByEmail(request.email().trim()).orElseThrow(() -> new IllegalArgumentException("Invalid or expired OTP"));
        validateNewPassword(user, request.newPassword());
        passwordOtps.verify(user, PasswordOtpPurpose.FORGOT_PASSWORD, request.otp());
        user.setPassword(encoder.encode(request.newPassword())); users.save(user);
        return ApiResponse.ok("Password reset successfully", null);
    }

    @PostMapping("/profile/image")
    public ApiResponse<Map<String, Object>> uploadProfileImage(@RequestParam("file") MultipartFile file) throws java.io.IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("Choose an image to upload");
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) throw new IllegalArgumentException("Only image files are supported");
        if (file.getSize() > 10 * 1024 * 1024) throw new IllegalArgumentException("Image must be smaller than 10 MB");
        User user = CurrentUser.get();
        user.setProfileImage(images.uploadProfileImage(file, user.getId()));
        return ApiResponse.ok("Profile image updated", userDto(users.save(user)));
    }

    private Map<String, Object> authPayload(User user) {
        return Map.of("token", jwtService.generate(user.getEmail()), "user", userDto(user));
    }

    private void validateNewPassword(User user, String newPassword) {
        if (newPassword.length() < 8) throw new IllegalArgumentException("New password must be at least 8 characters");
        if (encoder.matches(newPassword, user.getPassword())) throw new IllegalArgumentException("New password must be different from your current password");
    }

    public static Map<String, Object> userDto(User user) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", user.getId());
        dto.put("fullName", user.getFullName());
        dto.put("email", user.getEmail());
        dto.put("mobile", user.getMobile() == null ? "" : user.getMobile());
        dto.put("profileImage", user.getProfileImage() == null ? "" : user.getProfileImage());
        dto.put("role", user.getRole().name());
        dto.put("businessName", user.getBusinessName() == null ? "" : user.getBusinessName());
        dto.put("businessCategory", user.getBusinessCategory() == null ? "" : user.getBusinessCategory());
        dto.put("services", user.getServices() == null ? "" : user.getServices());
        dto.put("location", user.getLocation() == null ? "" : user.getLocation());
        dto.put("chapterName", user.getChapter() == null ? "" : user.getChapter().getChapterName());
        dto.put("chapterId", user.getChapter() == null ? "" : user.getChapter().getId());
        dto.put("subscriptionPlan", user.getSubscriptionPlan() == null ? "" : user.getSubscriptionPlan());
        dto.put("subscriptionAmount", user.getSubscriptionAmount() == null ? 0 : user.getSubscriptionAmount());
        dto.put("subscriptionStartDate", user.getSubscriptionStartDate() == null ? "" : user.getSubscriptionStartDate().toString());
        dto.put("subscriptionEndDate", user.getSubscriptionEndDate() == null ? "" : user.getSubscriptionEndDate().toString());
        dto.put("dateOfBirth", user.getDateOfBirth() == null ? "" : user.getDateOfBirth().toString());
        dto.put("enabled", user.isEnabled());
        return dto;
    }

    public record RegisterRequest(@NotBlank String fullName, @Email String email, String mobile, @NotBlank String password) {}
    public record LoginRequest(@Email String email, @NotBlank String password) {
        public LoginRequest {
            if (email != null) email = email.trim().toLowerCase();
        }
    }
    public record ProfileRequest(@NotBlank String fullName, String mobile, String location) {}
    public record ChangePasswordRequest(@NotBlank String currentPassword, @NotBlank String newPassword) {}
    public record ConfirmPasswordOtpRequest(@NotBlank String otp, @NotBlank String newPassword) {}
    public record ForgotPasswordRequest(@Email @NotBlank String email) {}
    public record ResetPasswordRequest(@Email @NotBlank String email, @NotBlank String otp, @NotBlank String newPassword) {}
}
