package com.networkers.groups;

import com.networkers.user.User;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.*;

interface GroupCategoryRepository extends JpaRepository<GroupCategory,Long>{List<GroupCategory> findByActiveTrueOrderByNameAsc();Optional<GroupCategory> findByNameIgnoreCaseAndActiveTrue(String name);}
interface GroupRepository extends JpaRepository<Group,Long>{
 @EntityGraph(attributePaths={"creator","creator.chapter","category"})
 @Query("select g from Group g where g.active=true and (:q='' or lower(g.name) like concat('%',:q,'%') or lower(g.description) like concat('%',:q,'%') or lower(g.category.name) like concat('%',:q,'%')) and (:cat is null or g.category.id=:cat)")
 Page<Group> discover(@Param("q") String q,@Param("cat") Long categoryId,Pageable pageable);
 @Query(value="select g from Group g left join GroupTopic t on t.group=g and t.active=true where g.active=true and (:q='' or lower(g.name) like concat('%',:q,'%') or lower(g.description) like concat('%',:q,'%') or lower(g.category.name) like concat('%',:q,'%')) and (:cat is null or g.category.id=:cat) group by g.id order by max(t.createdAt) desc nulls last, g.createdAt desc",
        countQuery="select count(g) from Group g where g.active=true and (:q='' or lower(g.name) like concat('%',:q,'%') or lower(g.description) like concat('%',:q,'%') or lower(g.category.name) like concat('%',:q,'%')) and (:cat is null or g.category.id=:cat)")
 Page<Group> recentlyActive(@Param("q") String q,@Param("cat") Long categoryId,Pageable pageable);
 @Query(value="select g from Group g left join GroupMember gm on gm.group=g where g.active=true and (:cat is null or g.category.id=:cat) and (:q='' or lower(g.name) like concat('%',:q,'%') or lower(g.description) like concat('%',:q,'%') or lower(g.category.name) like concat('%',:q,'%')) group by g.id order by count(gm.id) desc, g.createdAt desc",
        countQuery="select count(g) from Group g where g.active=true and (:cat is null or g.category.id=:cat) and (:q='' or lower(g.name) like concat('%',:q,'%') or lower(g.description) like concat('%',:q,'%') or lower(g.category.name) like concat('%',:q,'%'))")
 Page<Group> popular(@Param("cat") Long categoryId,@Param("q") String query,Pageable pageable);
 @EntityGraph(attributePaths={"creator","creator.chapter","category"}) Page<Group> findByActiveTrueAndCreator(User creator,Pageable pageable);
}
interface GroupMemberRepository extends JpaRepository<GroupMember,Long>{
 boolean existsByGroupAndMember(Group group,User member); Optional<GroupMember> findByGroupAndMember(Group group,User member);
 long countByGroup(Group group); List<GroupMember> findByGroupOrderByJoinedAtAsc(Group group); List<GroupMember> findByMemberOrderByJoinedAtDesc(User member);
}
interface GroupInvitationRepository extends JpaRepository<GroupInvitation,Long>{
 boolean existsByGroupAndInvitedMemberAndStatus(Group group,User member,String status);
 Page<GroupInvitation> findByInvitedMemberAndStatusOrderByCreatedAtDesc(User member,String status,Pageable pageable);
 Page<GroupInvitation> findByInvitedByOrderByCreatedAtDesc(User member,Pageable pageable);
}
interface GroupTopicRepository extends JpaRepository<GroupTopic,Long>{
 @EntityGraph(attributePaths={"creator","creator.chapter"})
 @Query("select t from GroupTopic t where t.group=:group and t.active=true and (:history=true or t.createdAt>=:cutoff) order by t.createdAt desc")
 Page<GroupTopic> feed(@Param("group") Group group,@Param("cutoff") LocalDateTime cutoff,@Param("history") boolean history,Pageable pageable);
 long countByGroupAndActiveTrue(Group group);
}
interface GroupTopicCommentRepository extends JpaRepository<GroupTopicComment,Long>{
 @EntityGraph(attributePaths={"member","member.chapter"}) Page<GroupTopicComment> findByTopicAndActiveTrueOrderByCreatedAtAsc(GroupTopic topic,Pageable pageable);
 long countByTopicAndActiveTrue(GroupTopic topic);
}
