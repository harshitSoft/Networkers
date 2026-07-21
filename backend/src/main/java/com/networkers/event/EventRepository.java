package com.networkers.event;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.EntityGraph;

public interface EventRepository extends JpaRepository<Event, Long> {
    @EntityGraph(attributePaths = {"images", "chapter"})
    List<Event> findAllByOrderByEventDateDesc();
    @EntityGraph(attributePaths = {"images", "chapter"})
    List<Event> findByEventTypeOrderByEventDateAsc(EventType eventType);
    @EntityGraph(attributePaths = {"images", "chapter"})
    List<Event> findByEventTypeAndEventDateGreaterThanEqualOrderByEventDateAsc(EventType eventType, LocalDate eventDate);
    List<Event> findByEventTypeAndEventDateBefore(EventType eventType, LocalDate eventDate);
}
