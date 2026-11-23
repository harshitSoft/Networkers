package com.networkers.tip;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TipRepository extends JpaRepository<Tip, Long> {
    List<Tip> findAllByOrderByCreatedAtDesc();
    List<Tip> findByStatusOrderByPublishedAtDesc(TipStatus status);
    List<Tip> findByStatusAndCategoryOrderByPublishedAtDesc(TipStatus status, TipCategory category);
}
