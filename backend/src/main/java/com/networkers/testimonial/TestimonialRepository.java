package com.networkers.testimonial;
import com.networkers.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface TestimonialRepository extends JpaRepository<Testimonial,Long> {
 Page<Testimonial> findBySender(User sender,Pageable pageable);
 Page<Testimonial> findByRecipientAndStatus(User recipient,TestimonialStatus status,Pageable pageable);
 Page<Testimonial> findByRecipient(User recipient,Pageable pageable);
 List<Testimonial> findTop5ByRecipientAndStatusAndVisibleTrueOrderBySubmittedAtDesc(User recipient,TestimonialStatus status);
 long countByRecipient(User user); long countBySender(User user); long countByRecipientAndStatus(User user,TestimonialStatus status);
 long countByStatus(TestimonialStatus status);
 Page<Testimonial> findAllByOrderBySubmittedAtDesc(Pageable pageable);
 Page<Testimonial> findByStatusOrderBySubmittedAtDesc(TestimonialStatus status,Pageable pageable);
 @Query("select (count(t)>0) from Testimonial t where t.sender=:sender and t.recipient=:recipient and t.description=:description and t.submittedAt>=:since")
 boolean existsRecentDuplicate(@Param("sender") User sender,@Param("recipient") User recipient,@Param("description") String description,@Param("since") java.time.LocalDateTime since);
}
