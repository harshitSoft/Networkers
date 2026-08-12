package com.networkers.meetingautomation;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface PairMeetingRepository extends JpaRepository<PairMeeting,Long> {
    @EntityGraph(attributePaths={"memberOne","memberTwo","completedBy"})
    List<PairMeeting> findByMeetingIdOrderByIdAsc(Long meetingId);
    @EntityGraph(attributePaths={"memberOne","memberTwo"})
    List<PairMeeting> findByMeetingGroupCycleId(Long cycleId);
    @Modifying @Query("delete from PairMeeting p where p.meeting.group.id=:groupId")
    void deleteByMeetingGroupId(@Param("groupId") Long groupId);
}
