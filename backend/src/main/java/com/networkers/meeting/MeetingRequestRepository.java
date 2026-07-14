package com.networkers.meeting;
import com.networkers.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface MeetingRequestRepository extends JpaRepository<MeetingRequest, Long> {
    List<MeetingRequest> findByReceiverOrderByCreatedAtDesc(User user);
    List<MeetingRequest> findByRequesterOrderByCreatedAtDesc(User user);
}
