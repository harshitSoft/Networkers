package com.networkers.referral;

import com.networkers.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.Optional;

public interface ReferralRevenueRepository extends JpaRepository<ReferralRevenue, Long> {
    Optional<ReferralRevenue> findByReferral(Referral referral);
    @Query("select coalesce(sum(r.amount), 0) from ReferralRevenue r where r.giver = :user")
    BigDecimal totalGiven(User user);
    @Query("select coalesce(sum(r.amount), 0) from ReferralRevenue r where r.receiver = :user")
    BigDecimal totalEarned(User user);
    @Query("select coalesce(sum(r.amount), 0) from ReferralRevenue r where r.giver = :user and r.month = :month and r.year = :year")
    BigDecimal monthGiven(User user, Integer month, Integer year);
    @Query("select coalesce(sum(r.amount), 0) from ReferralRevenue r where r.receiver = :user and r.month = :month and r.year = :year")
    BigDecimal monthEarned(User user, Integer month, Integer year);
}
