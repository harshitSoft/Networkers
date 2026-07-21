package com.networkers.community;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CommentRepository extends JpaRepository<Comment, Long> {
    long countByUser(com.networkers.user.User user);
    void deleteByPost(Post post);
    List<Comment> findByPostOrderByCreatedAtAsc(Post post);
}
