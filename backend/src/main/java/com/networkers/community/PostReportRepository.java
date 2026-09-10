package com.networkers.community;
import com.networkers.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PostReportRepository extends JpaRepository<PostReport,Long>{boolean existsByPostAndReporter(Post post,User reporter);List<PostReport> findAllByOrderByCreatedAtDesc();void deleteByPost(Post post);}
