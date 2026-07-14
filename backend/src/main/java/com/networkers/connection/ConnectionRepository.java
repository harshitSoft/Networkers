package com.networkers.connection;

import com.networkers.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    boolean existsBySenderAndReceiver(User sender, User receiver);
    Optional<Connection> findBySenderAndReceiver(User sender, User receiver);
    List<Connection> findBySenderOrderByCreatedAtDesc(User sender);
    List<Connection> findByReceiverOrderByCreatedAtDesc(User receiver);
    @Query("select c from Connection c where c.status = 'ACCEPTED' and (c.sender = :user or c.receiver = :user)")
    List<Connection> network(User user);
    @Query("select c from Connection c where c.status = 'PENDING' and c.sender = :sender")
    List<Connection> pendingSent(User sender);
    default boolean connected(User a, User b) {
        return findBySenderAndReceiver(a, b).filter(c -> c.getStatus() == ConnectionStatus.ACCEPTED).isPresent()
                || findBySenderAndReceiver(b, a).filter(c -> c.getStatus() == ConnectionStatus.ACCEPTED).isPresent();
    }
}
