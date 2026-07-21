package com.networkers.referral;

import com.networkers.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;

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
    @Query("select coalesce(sum(r.amount),0) from ReferralRevenue r") BigDecimal totalNetworkRevenue();
    @Query("select r.year,r.month,coalesce(sum(r.amount),0) from ReferralRevenue r group by r.year,r.month order by r.year,r.month") List<Object[]> monthlyNetworkRevenue();
}
