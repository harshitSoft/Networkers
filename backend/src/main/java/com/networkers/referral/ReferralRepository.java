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
}
