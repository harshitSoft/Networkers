package com.networkers.meetup;
import com.networkers.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface MeetupAttendeeRepository extends JpaRepository<MeetupAttendee, Long> {
    Optional<MeetupAttendee> findByMeetupAndUser(Meetup meetup, User user);
    List<MeetupAttendee> findByMeetup(Meetup meetup);
    List<MeetupAttendee> findByUserOrderByJoinedAtDesc(User user);
}
