package com.networkers.event;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {
    @Query("select distinct e from Event e left join fetch e.images left join fetch e.chapter where e.id = :id")
    Optional<Event> findWithDetailsById(Long id);
    Optional<Event> findFirstByTitleIgnoreCaseAndEventDateAndEventTimeAndLocationAndChapter(
            String title, LocalDate eventDate, java.time.LocalTime eventTime, String location, com.networkers.chapter.Chapter chapter);
    @EntityGraph(attributePaths = {"images", "chapter"})
    List<Event> findAllByOrderByEventDateDesc();
    @EntityGraph(attributePaths = {"images", "chapter"})
    List<Event> findByEventTypeOrderByEventDateAsc(EventType eventType);
    @EntityGraph(attributePaths = {"images", "chapter"})
    List<Event> findByEventTypeAndEventDateGreaterThanEqualOrderByEventDateAsc(EventType eventType, LocalDate eventDate);
    List<Event> findByEventTypeAndEventDateBefore(EventType eventType, LocalDate eventDate);
}
