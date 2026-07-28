package com.networkers.meetingautomation;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface PairMeetingRepository extends JpaRepository<PairMeeting,Long> {
    List<PairMeeting> findByMeetingIdOrderByIdAsc(Long meetingId);
    @Modifying @Query("delete from PairMeeting p where p.meeting.group.id=:groupId")
    void deleteByMeetingGroupId(@Param("groupId") Long groupId);
}
