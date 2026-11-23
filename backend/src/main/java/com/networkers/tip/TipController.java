package com.networkers.tip;

import com.networkers.common.ApiResponse;
import com.networkers.security.CurrentUser;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@RestController
public class TipController {
    private final TipRepository tips;
    public TipController(TipRepository tips){this.tips=tips;}

    @Transactional(readOnly = true) @GetMapping("/api/tips") public ApiResponse<List<Tip>> published(@RequestParam(required=false) TipCategory category){
        return ApiResponse.ok("Published tips", category==null?tips.findByStatusOrderByPublishedAtDesc(TipStatus.PUBLISHED):tips.findByStatusAndCategoryOrderByPublishedAtDesc(TipStatus.PUBLISHED,category));
    }
    @Transactional(readOnly = true) @GetMapping("/api/tips/{id}") public ApiResponse<Tip> publishedOne(@PathVariable Long id){Tip tip=find(id);if(tip.getStatus()!=TipStatus.PUBLISHED)throw new EntityNotFoundException("Tip not found");return ApiResponse.ok("Tip",tip);}

    @Transactional(readOnly = true) @PreAuthorize("hasRole('SUPER_ADMIN')") @GetMapping("/api/super-admin/tips") public ApiResponse<List<Tip>> all(){return ApiResponse.ok("Tips",tips.findAllByOrderByCreatedAtDesc());}
    @PreAuthorize("hasRole('SUPER_ADMIN')") @PostMapping("/api/super-admin/tips") public ApiResponse<Tip> create(@RequestBody TipRequest request){Tip tip=new Tip();apply(tip,request);tip.setCreatedById(CurrentUser.get().getId());Tip saved=tips.save(tip);return ApiResponse.ok("Tip created",saved);}
    @Transactional(readOnly = true) @PreAuthorize("hasRole('SUPER_ADMIN')") @GetMapping("/api/super-admin/tips/{id}") public ApiResponse<Tip> adminOne(@PathVariable Long id){return ApiResponse.ok("Tip",find(id));}
    @PreAuthorize("hasRole('SUPER_ADMIN')") @PutMapping("/api/super-admin/tips/{id}") public ApiResponse<Tip> update(@PathVariable Long id,@RequestBody TipRequest request){Tip tip=find(id);apply(tip,request);return ApiResponse.ok("Tip updated",tips.save(tip));}
    @PreAuthorize("hasRole('SUPER_ADMIN')") @PatchMapping("/api/super-admin/tips/{id}/publish") public ApiResponse<Tip> publish(@PathVariable Long id){Tip tip=find(id);if(tip.getStatus()!=TipStatus.PUBLISHED)tip.setPublishedAt(LocalDateTime.now());tip.setStatus(TipStatus.PUBLISHED);return ApiResponse.ok("Tip published",tips.save(tip));}
    @PreAuthorize("hasRole('SUPER_ADMIN')") @PatchMapping("/api/super-admin/tips/{id}/unpublish") public ApiResponse<Tip> unpublish(@PathVariable Long id){Tip tip=find(id);tip.setStatus(TipStatus.UNPUBLISHED);return ApiResponse.ok("Tip unpublished",tips.save(tip));}
    @PreAuthorize("hasRole('SUPER_ADMIN')") @DeleteMapping("/api/super-admin/tips/{id}") public ApiResponse<Boolean> delete(@PathVariable Long id){tips.delete(find(id));return ApiResponse.ok("Tip deleted",true);}
    private Tip find(Long id){return tips.findById(id).orElseThrow(()->new EntityNotFoundException("Tip not found"));}
    private void apply(Tip tip,TipRequest request){
        if(request.title()==null||request.title().isBlank())throw new IllegalArgumentException("Tip title is required");
        if(request.title().length()>180)throw new IllegalArgumentException("Tip title must be 180 characters or fewer");
        if(request.content()==null||request.content().isBlank())throw new IllegalArgumentException("Tip content is required");
        if(request.category()==null)throw new IllegalArgumentException("Choose a tip category");
        tip.setTitle(request.title().trim());tip.setShortDescription(request.shortDescription());tip.setContent(request.content().trim());tip.setImageUrl(request.imageUrl());tip.setCategory(request.category());
        TipStatus status=request.status()==null?TipStatus.DRAFT:request.status();
        if(status==TipStatus.PUBLISHED&&tip.getStatus()!=TipStatus.PUBLISHED)tip.setPublishedAt(LocalDateTime.now());
        tip.setStatus(status);
    }
    public record TipRequest(String title,String shortDescription,String content,String imageUrl,TipCategory category,TipStatus status){}
}
