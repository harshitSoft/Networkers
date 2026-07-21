package com.networkers.community;

import com.networkers.media.CloudinaryImageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;

@Service
public class PostRetentionService {
 private static final Logger log=LoggerFactory.getLogger(PostRetentionService.class);
 private final PostRepository posts;private final CommentRepository comments;private final CloudinaryImageService media;
 public PostRetentionService(PostRepository posts,CommentRepository comments,CloudinaryImageService media){this.posts=posts;this.comments=comments;this.media=media;}
 @Scheduled(cron="0 15 2 * * *",zone="Asia/Kolkata") @Transactional
 public void deleteExpiredCommunityPosts(){LocalDateTime cutoff=LocalDateTime.now(ZoneId.of("Asia/Kolkata")).minusDays(90);var expired=posts.findByCreatedAtBefore(cutoff);for(Post post:expired){comments.deleteByPost(post);posts.delete(post);try{media.deleteCommunityMedia(post.getMediaUrl(),post.getMediaType());}catch(Exception e){log.warn("Post {} was deleted but its remote media could not be removed",post.getId(),e);}}if(!expired.isEmpty())log.info("Deleted {} Community Stories posts older than 90 days",expired.size());}
}
