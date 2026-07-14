package com.networkers.community;

import com.networkers.common.ApiResponse;
import com.networkers.security.CurrentUser;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/community/posts")
public class CommunityController {
    private final PostRepository posts;
    private final CommentRepository comments;
    public CommunityController(PostRepository posts, CommentRepository comments) { this.posts = posts; this.comments = comments; }
    @PostMapping public ApiResponse<Post> create(@RequestBody PostRequest r) {
        Post p = new Post(); p.setUser(CurrentUser.get()); apply(p, r);
        return ApiResponse.ok("Post created", posts.save(p));
    }
    @GetMapping public ApiResponse<List<Post>> all() { return ApiResponse.ok("Community posts", posts.findAllByOrderByCreatedAtDesc()); }
    @GetMapping("/{id}") public ApiResponse<Post> one(@PathVariable Long id) { return ApiResponse.ok("Post", get(id)); }
    @PutMapping("/{id}") public ApiResponse<Post> update(@PathVariable Long id, @RequestBody PostRequest r) { return ApiResponse.ok("Post updated", posts.save(apply(owned(id), r))); }
    @DeleteMapping("/{id}") public ApiResponse<Void> delete(@PathVariable Long id) { posts.delete(owned(id)); return ApiResponse.ok("Post deleted", null); }
    @PostMapping("/{id}/comments") public ApiResponse<Comment> comment(@PathVariable Long id, @RequestBody CommentRequest r) {
        Comment c = new Comment(); c.setPost(get(id)); c.setUser(CurrentUser.get()); c.setContent(r.content());
        return ApiResponse.ok("Comment added", comments.save(c));
    }
    @GetMapping("/{id}/comments") public ApiResponse<List<Comment>> comments(@PathVariable Long id) { return ApiResponse.ok("Comments", comments.findByPostOrderByCreatedAtAsc(get(id))); }
    private Post get(Long id) { return posts.findById(id).orElseThrow(() -> new EntityNotFoundException("Post not found")); }
    private Post owned(Long id) {
        Post p = get(id);
        if (!p.getUser().getId().equals(CurrentUser.get().getId())) throw new IllegalStateException("Not allowed");
        return p;
    }
    private Post apply(Post p, PostRequest r) { p.setTitle(r.title()); p.setContent(r.content()); if (r.type() != null) p.setType(r.type()); return p; }
    public record PostRequest(PostType type, String title, String content) {}
    public record CommentRequest(String content) {}
}
