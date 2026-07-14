package com.networkers.referral;

import com.networkers.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface OpenReferralPostRepository extends JpaRepository<OpenReferralPost, Long> {
    List<OpenReferralPost> findByPostedByOrderByCreatedAtDesc(User user);

    @Query("""
            select p from OpenReferralPost p
            where p.active = true
            and p.postedBy <> :user
            and exists (
                select c from Connection c
                where c.status = com.networkers.connection.ConnectionStatus.ACCEPTED
                and ((c.sender = :user and c.receiver = p.postedBy) or (c.receiver = :user and c.sender = p.postedBy))
            )
            order by p.createdAt desc
            """)
    List<OpenReferralPost> openFromNetwork(User user);
}
