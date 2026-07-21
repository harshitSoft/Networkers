package com.networkers.joinrequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface JoinRequestRepository extends JpaRepository<JoinRequest,Long>{
    boolean existsByEmailIgnoreCaseAndStatusIn(String email, List<JoinRequestStatus> statuses);
    List<JoinRequest> findAllByOrderByCreatedAtDesc();
    long countByStatus(JoinRequestStatus status);
}
