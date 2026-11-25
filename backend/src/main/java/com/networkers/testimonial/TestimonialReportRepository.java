package com.networkers.testimonial;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface TestimonialReportRepository extends JpaRepository<TestimonialReport,Long> {
 boolean existsByTestimonialIdAndReporterId(Long testimonialId,Long reporterId);
 List<TestimonialReport> findByResolvedFalseOrderByCreatedAtDesc();
}
