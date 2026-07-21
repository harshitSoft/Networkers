package com.networkers.referral;

import com.networkers.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ReferralRepository extends JpaRepository<Referral, Long> {
    List<Referral> findByReceivedByOrderByCreatedAtDesc(User user);
    List<Referral> findByGivenByOrderByCreatedAtDesc(User user);
    Optional<Referral> findByOpenReferralPostAndReceivedBy(OpenReferralPost post, User user);
    long countByStatus(ReferralStatus status);
    long countByGivenBy(User user);
    long countByReceivedBy(User user);
    @Query("select coalesce(sum(r.confirmedAmount), 0) from Referral r where r.status in ('CONFIRMED', 'COMPLETED')")
    BigDecimal totalBusinessGenerated();
    @Query("select coalesce(sum(r.confirmedAmount), 0) from Referral r where r.status in ('CONFIRMED', 'COMPLETED') and r.givenBy = :user")
    BigDecimal businessGivenBy(User user);
    @Query("select coalesce(sum(r.confirmedAmount), 0) from Referral r where r.status in ('CONFIRMED', 'COMPLETED') and r.receivedBy = :user")
    BigDecimal businessConvertedBy(User user);
    @Query("select coalesce(sum(coalesce(r.confirmedAmount,r.businessValue,0)),0) from Referral r where r.status in (com.networkers.referral.ReferralStatus.CONFIRMED,com.networkers.referral.ReferralStatus.COMPLETED,com.networkers.referral.ReferralStatus.CONVERTED)")
    BigDecimal totalNetworkBusiness();
    @Query("select coalesce(sum(coalesce(r.confirmedAmount,r.businessValue,0)),0) from Referral r where r.givenBy=:user and r.status in (com.networkers.referral.ReferralStatus.CONFIRMED,com.networkers.referral.ReferralStatus.COMPLETED,com.networkers.referral.ReferralStatus.CONVERTED)")
    BigDecimal totalBusinessGivenBy(User user);
    @Query("select year(r.updatedAt),month(r.updatedAt),coalesce(sum(coalesce(r.confirmedAmount,r.businessValue,0)),0) from Referral r where r.status in (com.networkers.referral.ReferralStatus.CONFIRMED,com.networkers.referral.ReferralStatus.COMPLETED,com.networkers.referral.ReferralStatus.CONVERTED) group by year(r.updatedAt),month(r.updatedAt) order by year(r.updatedAt),month(r.updatedAt)")
    List<Object[]> monthlyNetworkBusiness();
}
