package com.networkers.opportunity;
import com.networkers.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {
    List<Opportunity> findByPostedByOrderByCreatedAtDesc(User user);
    List<Opportunity> findAllByOrderByCreatedAtDesc();
}
