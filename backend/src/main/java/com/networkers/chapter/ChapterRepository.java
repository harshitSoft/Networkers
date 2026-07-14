package com.networkers.chapter;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    Optional<Chapter> findByChapterName(String chapterName);
    boolean existsByChapterNumber(Integer chapterNumber);
    List<Chapter> findByActiveTrueOrderByChapterNumberAsc();
    List<Chapter> findAllByOrderByChapterNumberAsc();
}
