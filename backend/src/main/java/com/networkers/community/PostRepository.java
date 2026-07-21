package com.networkers.community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.time.LocalDateTime;
public interface PostRepository extends JpaRepository<Post, Long> {
    long countByUser(com.networkers.user.User user);
    @Query("select count(p) from Post p join p.kudos k where k = :user") long countKudosGivenBy(@Param("user") com.networkers.user.User user);
    List<Post> findAllByOrderByCreatedAtDesc();
    List<Post> findByCreatedAtBefore(LocalDateTime cutoff);
    @Modifying
    @Query("update Post p set p.meeting = null where p.meeting.group.id = :groupId")
    void unlinkMeetingGroup(@Param("groupId") Long groupId);
}
