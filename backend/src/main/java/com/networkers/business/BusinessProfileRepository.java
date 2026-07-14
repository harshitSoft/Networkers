package com.networkers.business;

import com.networkers.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BusinessProfileRepository extends JpaRepository<BusinessProfile, Long> {
    Optional<BusinessProfile> findByUser(User user);
    boolean existsByUser(User user);

    @Query("""
            select b from BusinessProfile b where
            (:keyword is null or lower(b.businessName) like lower(concat('%', :keyword, '%')) or lower(b.services) like lower(concat('%', :keyword, '%')) or lower(b.description) like lower(concat('%', :keyword, '%')))
            and (:city is null or lower(b.city) = lower(:city))
            and (:category is null or lower(b.category) = lower(:category))
            and b.user.enabled = true
            and b.user.deleted = false
            """)
    List<BusinessProfile> search(String keyword, String city, String category);

    @Query("select b from BusinessProfile b where b.user.enabled = true and b.user.deleted = false")
    List<BusinessProfile> findActiveProfiles();
}
