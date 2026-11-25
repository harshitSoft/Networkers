package com.networkers.connection;

import com.networkers.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    boolean existsBySenderAndReceiver(User sender, User receiver);
    Optional<Connection> findBySenderAndReceiver(User sender, User receiver);
    List<Connection> findAllBySenderAndReceiverOrderByCreatedAtDesc(User sender, User receiver);
    List<Connection> findBySenderOrderByCreatedAtDesc(User sender);
    List<Connection> findByReceiverOrderByCreatedAtDesc(User receiver);
    @Query("select c from Connection c where c.sender = :user or c.receiver = :user")
    List<Connection> involving(@Param("user") User user);
    @Query("select c from Connection c where c.status = 'ACCEPTED' and (c.sender = :user or c.receiver = :user)")
    List<Connection> network(User user);
    @Query(value = "select distinct c from Connection c left join BusinessProfile bs on bs.user = c.sender left join BusinessProfile br on br.user = c.receiver where c.status = 'ACCEPTED' and (c.sender = :user or c.receiver = :user) and (:keyword = '' or lower(c.sender.fullName) like concat('%',:keyword,'%') or lower(c.receiver.fullName) like concat('%',:keyword,'%') or lower(coalesce(c.sender.businessName,'')) like concat('%',:keyword,'%') or lower(coalesce(c.receiver.businessName,'')) like concat('%',:keyword,'%') or lower(coalesce(bs.businessName,'')) like concat('%',:keyword,'%') or lower(coalesce(br.businessName,'')) like concat('%',:keyword,'%') or lower(coalesce(c.sender.businessCategory,'')) like concat('%',:keyword,'%') or lower(coalesce(c.receiver.businessCategory,'')) like concat('%',:keyword,'%') or lower(coalesce(bs.category,'')) like concat('%',:keyword,'%') or lower(coalesce(br.category,'')) like concat('%',:keyword,'%') or lower(coalesce(c.sender.location,'')) like concat('%',:keyword,'%') or lower(coalesce(c.receiver.location,'')) like concat('%',:keyword,'%') or lower(coalesce(bs.city,'')) like concat('%',:keyword,'%') or lower(coalesce(br.city,'')) like concat('%',:keyword,'%') or lower(coalesce(bs.country,'')) like concat('%',:keyword,'%') or lower(coalesce(br.country,'')) like concat('%',:keyword,'%') or lower(coalesce(c.sender.chapter.chapterName,'')) like concat('%',:keyword,'%') or lower(coalesce(c.receiver.chapter.chapterName,'')) like concat('%',:keyword,'%'))",
            countQuery = "select count(distinct c.id) from Connection c left join BusinessProfile bs on bs.user = c.sender left join BusinessProfile br on br.user = c.receiver where c.status = 'ACCEPTED' and (c.sender = :user or c.receiver = :user) and (:keyword = '' or lower(c.sender.fullName) like concat('%',:keyword,'%') or lower(c.receiver.fullName) like concat('%',:keyword,'%') or lower(coalesce(c.sender.businessName,'')) like concat('%',:keyword,'%') or lower(coalesce(c.receiver.businessName,'')) like concat('%',:keyword,'%') or lower(coalesce(bs.businessName,'')) like concat('%',:keyword,'%') or lower(coalesce(br.businessName,'')) like concat('%',:keyword,'%') or lower(coalesce(c.sender.businessCategory,'')) like concat('%',:keyword,'%') or lower(coalesce(c.receiver.businessCategory,'')) like concat('%',:keyword,'%') or lower(coalesce(bs.category,'')) like concat('%',:keyword,'%') or lower(coalesce(br.category,'')) like concat('%',:keyword,'%') or lower(coalesce(c.sender.location,'')) like concat('%',:keyword,'%') or lower(coalesce(c.receiver.location,'')) like concat('%',:keyword,'%') or lower(coalesce(bs.city,'')) like concat('%',:keyword,'%') or lower(coalesce(br.city,'')) like concat('%',:keyword,'%') or lower(coalesce(bs.country,'')) like concat('%',:keyword,'%') or lower(coalesce(br.country,'')) like concat('%',:keyword,'%') or lower(coalesce(c.sender.chapter.chapterName,'')) like concat('%',:keyword,'%') or lower(coalesce(c.receiver.chapter.chapterName,'')) like concat('%',:keyword,'%'))")
    Page<Connection> networkPage(@Param("user") User user, @Param("keyword") String keyword, Pageable pageable);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Connection c where c.id = :id")
    Optional<Connection> findByIdForUpdate(@Param("id") Long id);
    @Query("select c from Connection c where c.status = 'PENDING' and c.receiver = :receiver order by c.createdAt desc")
    List<Connection> pendingReceived(User receiver);
    @Query("select c from Connection c where c.status = 'PENDING' and c.sender = :sender")
    List<Connection> pendingSent(User sender);
    long countByReceiverAndStatus(User receiver, ConnectionStatus status);
    long countBySenderAndStatus(User sender, ConnectionStatus status);
    long countByStatus(ConnectionStatus status);
    long countByStatusAndCreatedAtAfter(ConnectionStatus status, LocalDateTime after);
    @Query("select count(c) from Connection c where c.status = 'ACCEPTED' and (c.sender = :user or c.receiver = :user) and c.createdAt > :after")
    long countRecentForUser(@Param("user") User user, @Param("after") LocalDateTime after);
    @Query("select c from Connection c left join BusinessProfile bs on bs.user = c.sender left join BusinessProfile br on br.user = c.receiver where (:status is null or c.status = :status) and (:keyword = '' or lower(c.sender.fullName) like concat('%',:keyword,'%') or lower(c.receiver.fullName) like concat('%',:keyword,'%') or lower(coalesce(c.sender.chapter.chapterName,'')) like concat('%',:keyword,'%') or lower(coalesce(c.receiver.chapter.chapterName,'')) like concat('%',:keyword,'%') or lower(coalesce(bs.country,'')) like concat('%',:keyword,'%') or lower(coalesce(br.country,'')) like concat('%',:keyword,'%'))")
    Page<Connection> adminSearch(@Param("status") ConnectionStatus status, @Param("keyword") String keyword, Pageable pageable);
    default boolean connected(User a, User b) {
        return findBySenderAndReceiver(a, b).filter(c -> c.getStatus() == ConnectionStatus.ACCEPTED).isPresent()
                || findBySenderAndReceiver(b, a).filter(c -> c.getStatus() == ConnectionStatus.ACCEPTED).isPresent();
    }
}
