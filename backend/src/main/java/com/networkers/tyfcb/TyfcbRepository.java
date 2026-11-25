package com.networkers.tyfcb;

import com.networkers.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TyfcbRepository extends JpaRepository<Tyfcb, Long> {
    List<Tyfcb> findByReceivedByOrderBySubmittedAtDesc(User user);
    List<Tyfcb> findByThankYouToOrderBySubmittedAtDesc(User user);
    boolean existsByReferralId(Long referralId);
    long countByReceivedBy(User user);
    long countByThankYouTo(User user);
}
