package com.networkers.meetup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface MeetupRepository extends JpaRepository<Meetup, Long> {
    List<Meetup> findAllByOrderByDateAscStartTimeAsc();
    long countByStatus(MeetupStatus status);
}
