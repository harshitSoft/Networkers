package com.networkers.community;

import com.networkers.common.ApiResponse;
import com.networkers.security.CurrentUser;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
public class PostModerationController {
 private final PostRepository posts;private final PostReportRepository reports;private final CommentRepository comments;
 public PostModerationController(PostRepository p,PostReportRepository r,CommentRepository c){posts=p;reports=r;comments=c;}
 @PostMapping("/api/community/posts/{id}/reports") @Transactional public ApiResponse<?> report(@PathVariable Long id,@RequestBody ReportRequest request){Post post=posts.findById(id).orElseThrow(()->new EntityNotFoundException("Post not found"));if(post.getUser().getId().equals(CurrentUser.get().getId()))throw new IllegalArgumentException("You cannot report your own post");if(reports.existsByPostAndReporter(post,CurrentUser.get()))throw new IllegalStateException("You already reported this post");PostReport report=new PostReport();report.setPost(post);report.setReporter(CurrentUser.get());report.setReason(request.reason()==null||request.reason().isBlank()?"Inappropriate or unwanted content":request.reason().trim());reports.save(report);return ApiResponse.ok("Post reported to the admin",true);}
 @GetMapping("/api/admin/post-reports") @Transactional(readOnly=true) public ApiResponse<?> reports(){return ApiResponse.ok("Post reports",reports.findAllByOrderByCreatedAtDesc().stream().map(r->Map.of("id",r.getId(),"reason",r.getReason(),"createdAt",r.getCreatedAt(),"post",postView(r.getPost()),"reporterName",r.getReporter().getFullName())).toList());}
 @GetMapping("/api/admin/community-posts") @Transactional(readOnly=true) public ApiResponse<?> posts(){return ApiResponse.ok("Community posts",posts.findAllByOrderByCreatedAtDesc().stream().map(this::postView).toList());}
 @DeleteMapping("/api/admin/community-posts/{id}") @Transactional public ApiResponse<?> delete(@PathVariable Long id){Post post=posts.findById(id).orElseThrow(()->new EntityNotFoundException("Post not found"));reports.deleteByPost(post);reports.flush();comments.deleteByPost(post);comments.flush();posts.delete(post);return ApiResponse.ok("Post deleted by admin",true);}
 private Map<String,Object> postView(Post p){Map<String,Object> map=new LinkedHashMap<>();map.put("id",p.getId());map.put("caption",p.getContent());map.put("mediaUrl",p.getMediaUrl());map.put("authorName",p.getUser().getFullName());map.put("authorId",p.getUser().getId());map.put("createdAt",p.getCreatedAt());return map;}
 public record ReportRequest(String reason){}
}
