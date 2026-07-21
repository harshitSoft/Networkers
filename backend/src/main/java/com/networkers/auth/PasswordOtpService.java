package com.networkers.auth;

import com.networkers.mail.AccountMailService;
import com.networkers.user.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class PasswordOtpService {
    private static final int EXPIRY_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 5;
    private final PasswordOtpRepository otps;
    private final PasswordEncoder encoder;
    private final AccountMailService mail;
    private final SecureRandom random = new SecureRandom();

    public PasswordOtpService(PasswordOtpRepository otps, PasswordEncoder encoder, AccountMailService mail) {
        this.otps = otps; this.encoder = encoder; this.mail = mail;
    }

    @Transactional
    public void issue(User user, PasswordOtpPurpose purpose) {
        otps.findTopByUserAndPurposeAndUsedFalseOrderByCreatedAtDesc(user, purpose).ifPresent(existing -> {
            if (existing.getCreatedAt() != null && existing.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(60)))
                throw new IllegalStateException("Please wait one minute before requesting another OTP");
            existing.setUsed(true); otps.save(existing);
        });
        String code = "%06d".formatted(random.nextInt(1_000_000));
        PasswordOtp otp = new PasswordOtp();
        otp.setUser(user); otp.setPurpose(purpose); otp.setCodeHash(encoder.encode(code));
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES));
        otps.save(otp);
        mail.sendPasswordOtp(user.getFullName(), user.getEmail(), code,
                purpose == PasswordOtpPurpose.FORGOT_PASSWORD ? "reset your password" : "change your password");
    }

    @Transactional
    public void verify(User user, PasswordOtpPurpose purpose, String code) {
        PasswordOtp otp = otps.findTopByUserAndPurposeAndUsedFalseOrderByCreatedAtDesc(user, purpose)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired OTP"));
        if (otp.getExpiresAt().isBefore(LocalDateTime.now()) || otp.getFailedAttempts() >= MAX_ATTEMPTS) {
            otp.setUsed(true); otps.save(otp); throw new IllegalArgumentException("Invalid or expired OTP");
        }
        if (!encoder.matches(code, otp.getCodeHash())) {
            otp.setFailedAttempts(otp.getFailedAttempts() + 1);
            if (otp.getFailedAttempts() >= MAX_ATTEMPTS) otp.setUsed(true);
            otps.save(otp); throw new IllegalArgumentException("Invalid or expired OTP");
        }
        otp.setUsed(true); otps.save(otp);
    }
}
