package com.networkers.meetup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDate;
public interface MeetupRepository extends JpaRepository<Meetup, Long> {
    List<Meetup> findAllByOrderByDateAscStartTimeAsc();
    long countByStatus(MeetupStatus status);
    List<Meetup> findByStatusAndDateBefore(MeetupStatus status, LocalDate date);
}
