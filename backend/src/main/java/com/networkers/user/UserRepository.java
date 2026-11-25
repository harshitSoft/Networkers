package com.networkers.user;

import com.networkers.chapter.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

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
    @Query("select u from User u where u.deleted = false and u.role in (com.networkers.user.Role.USER, com.networkers.user.Role.BUSINESS_USER) order by u.fullName asc")
    List<User> findAllBillableMembers();
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
    @Query("select u from User u where u.deleted=false and u.enabled=true and u.role in (com.networkers.user.Role.USER, com.networkers.user.Role.BUSINESS_USER) and (:name='' or lower(coalesce(u.fullName,'')) like concat('%',lower(:name),'%') or lower(coalesce(u.businessName,'')) like concat('%',lower(:name),'%') or lower(coalesce(u.businessCategory,'')) like concat('%',lower(:name),'%')) order by u.fullName asc")
    List<User> searchTestimonialMembers(String name);
    @Query("select distinct u.businessCategory from User u where u.deleted=false and u.enabled=true and u.role in (com.networkers.user.Role.USER, com.networkers.user.Role.BUSINESS_USER) and u.businessCategory is not null and trim(u.businessCategory)<>'' order by u.businessCategory")
    List<String> findActiveBusinessCategories();

    @Query(value = """
            select distinct u from User u left join BusinessProfile b on b.user = u
            where u.deleted = false and u.enabled = true and u.role = com.networkers.user.Role.USER
              and (:memberId is null or u.id <> :memberId)
              and (:keyword = '' or lower(coalesce(u.fullName,'')) like concat('%',:keyword,'%')
                or lower(coalesce(u.businessName,'')) like concat('%',:keyword,'%')
                or lower(coalesce(u.businessCategory,'')) like concat('%',:keyword,'%')
                or lower(coalesce(u.services,'')) like concat('%',:keyword,'%')
                or lower(coalesce(u.location,'')) like concat('%',:keyword,'%')
                or lower(coalesce(b.businessName,'')) like concat('%',:keyword,'%')
                or lower(coalesce(b.category,'')) like concat('%',:keyword,'%')
                or lower(coalesce(b.professionalTitle,'')) like concat('%',:keyword,'%')
                or lower(coalesce(b.description,'')) like concat('%',:keyword,'%')
                or lower(coalesce(b.services,'')) like concat('%',:keyword,'%')
                or lower(coalesce(b.city,'')) like concat('%',:keyword,'%')
                or lower(coalesce(b.state,'')) like concat('%',:keyword,'%')
                or lower(coalesce(u.chapter.chapterName,'')) like concat('%',:keyword,'%'))
              and (:city = '' or lower(coalesce(b.city,u.location,'')) like concat('%',:city,'%'))
              and (:state = '' or lower(coalesce(b.state,'')) like concat('%',:state,'%'))
              and (:country = '' or lower(coalesce(b.country,'')) like concat('%',:country,'%'))
              and (:profession = '' or lower(coalesce(b.professionalTitle,u.businessCategory,'')) like concat('%',:profession,'%'))
              and (:category = '' or lower(coalesce(u.businessCategory,b.category,'')) like concat('%',:category,'%'))
              and (:chapterId is null or u.chapter.id = :chapterId)
              and (:groupId is null or exists (select gm.id from GroupMember gm where gm.member = u and gm.group.id = :groupId))
            """,
            countQuery = """
            select count(distinct u.id) from User u left join BusinessProfile b on b.user = u
            where u.deleted = false and u.enabled = true and u.role = com.networkers.user.Role.USER
              and (:memberId is null or u.id <> :memberId)
              and (:keyword = '' or lower(coalesce(u.fullName,'')) like concat('%',:keyword,'%')
                or lower(coalesce(u.businessName,'')) like concat('%',:keyword,'%')
                or lower(coalesce(u.businessCategory,'')) like concat('%',:keyword,'%')
                or lower(coalesce(u.services,'')) like concat('%',:keyword,'%')
                or lower(coalesce(u.location,'')) like concat('%',:keyword,'%')
                or lower(coalesce(b.businessName,'')) like concat('%',:keyword,'%')
                or lower(coalesce(b.category,'')) like concat('%',:keyword,'%')
                or lower(coalesce(b.professionalTitle,'')) like concat('%',:keyword,'%')
                or lower(coalesce(b.description,'')) like concat('%',:keyword,'%')
                or lower(coalesce(b.services,'')) like concat('%',:keyword,'%')
                or lower(coalesce(b.city,'')) like concat('%',:keyword,'%')
                or lower(coalesce(b.state,'')) like concat('%',:keyword,'%')
                or lower(coalesce(u.chapter.chapterName,'')) like concat('%',:keyword,'%'))
              and (:city = '' or lower(coalesce(b.city,u.location,'')) like concat('%',:city,'%'))
              and (:state = '' or lower(coalesce(b.state,'')) like concat('%',:state,'%'))
              and (:country = '' or lower(coalesce(b.country,'')) like concat('%',:country,'%'))
              and (:profession = '' or lower(coalesce(b.professionalTitle,u.businessCategory,'')) like concat('%',:profession,'%'))
              and (:category = '' or lower(coalesce(u.businessCategory,b.category,'')) like concat('%',:category,'%'))
              and (:chapterId is null or u.chapter.id = :chapterId)
              and (:groupId is null or exists (select gm.id from GroupMember gm where gm.member = u and gm.group.id = :groupId))
            """)
    Page<User> searchGlobalDirectory(@Param("memberId") Long memberId, @Param("keyword") String keyword,
                                     @Param("city") String city, @Param("state") String state,
                                     @Param("country") String country, @Param("profession") String profession,
                                     @Param("category") String category, @Param("chapterId") Long chapterId,
                                     @Param("groupId") Long groupId,
                                     Pageable pageable);
}
