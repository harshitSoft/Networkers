package com.networkers.auth;

import com.networkers.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordOtpRepository extends JpaRepository<PasswordOtp, Long> {
    Optional<PasswordOtp> findTopByUserAndPurposeAndUsedFalseOrderByCreatedAtDesc(User user, PasswordOtpPurpose purpose);
}
