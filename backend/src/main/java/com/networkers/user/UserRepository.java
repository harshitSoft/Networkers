package com.networkers.user;

import com.networkers.chapter.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("select u from User u where lower(trim(u.email)) = lower(trim(:email)) and u.deleted = false")
    Optional<User> findByEmail(String email);
    @Query("select (count(u) > 0) from User u where lower(trim(u.email)) = lower(trim(:email)) and u.deleted = false")
    boolean existsByEmail(String email);
    boolean existsByRole(Role role);
    @Query("select u from User u where u.role = :role and u.deleted = false")
    List<User> findByRole(Role role);
    long countByRoleAndDeletedFalse(Role role);
    List<User> findByDeletedFalseOrderByCreatedAtDesc();
    List<User> findByChapterAndDeletedFalseOrderByFullNameAsc(Chapter chapter);
    List<User> findByChapterAndEnabledTrueAndDeletedFalseOrderByFullNameAsc(Chapter chapter);
    long countByChapterAndDeletedFalse(Chapter chapter);
    List<User> findByEnabledTrueAndDeletedFalseAndSubscriptionEndDateBetween(LocalDate from, LocalDate to);
    @Query("""
            select u from User u
            where u.deleted = false and u.role = com.networkers.user.Role.USER
              and (:chapterId is null or u.chapter.id = :chapterId)
              and u.enabled = true
              and (:category = '' or lower(coalesce(u.businessCategory, '')) like concat('%', lower(:category), '%'))
              and (:location = '' or lower(coalesce(u.location, '')) like concat('%', lower(:location), '%'))
              and (:name = '' or lower(coalesce(u.fullName, '')) like concat('%', lower(:name), '%') or lower(coalesce(u.businessName, '')) like concat('%', lower(:name), '%') or lower(coalesce(u.services, '')) like concat('%', lower(:name), '%'))
            order by u.fullName asc
            """)
    List<User> searchMembers(Long chapterId, String category, String location, String name);
}
