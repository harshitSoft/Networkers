package com.networkers.user;

import com.networkers.chapter.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("select u from User u where u.email = :email and u.deleted = false")
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRole(Role role);
    @Query("select u from User u where u.role = :role and u.deleted = false")
    List<User> findByRole(Role role);
    List<User> findByDeletedFalseOrderByCreatedAtDesc();
    List<User> findByChapterAndDeletedFalseOrderByFullNameAsc(Chapter chapter);
    long countByChapterAndDeletedFalse(Chapter chapter);
    @Query("""
            select u from User u
            where u.deleted = false and u.role = com.networkers.user.Role.USER
              and (:chapterId is null or u.chapter.id = :chapterId)
              and (:category is null or lower(u.businessCategory) like lower(concat('%', :category, '%')))
              and (:location is null or lower(u.location) like lower(concat('%', :location, '%')))
              and (:name is null or lower(u.fullName) like lower(concat('%', :name, '%')) or lower(u.businessName) like lower(concat('%', :name, '%')) or lower(u.services) like lower(concat('%', :name, '%')))
            order by u.fullName asc
            """)
    List<User> searchMembers(Long chapterId, String category, String location, String name);
}
