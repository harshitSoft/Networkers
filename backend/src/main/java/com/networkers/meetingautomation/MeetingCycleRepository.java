package com.networkers.meetingautomation;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.*;

public interface MeetingCycleRepository extends JpaRepository<MeetingCycle,Long> {
    Optional<MeetingCycle> findFirstByChapterIdOrderByCycleNumberDesc(Long chapterId);
    Optional<MeetingCycle> findFirstByChapterIdAndStatusOrderByCycleNumberDesc(Long chapterId,MeetingCycleStatus status);
    List<MeetingCycle> findByStatusAndNextCycleDateLessThanEqual(MeetingCycleStatus status,LocalDate date);
}
