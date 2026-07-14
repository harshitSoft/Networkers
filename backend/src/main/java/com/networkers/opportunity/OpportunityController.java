package com.networkers.opportunity;

import com.networkers.common.ApiResponse;
import com.networkers.security.CurrentUser;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/opportunities")
public class OpportunityController {
    private final OpportunityRepository opportunities;
    public OpportunityController(OpportunityRepository opportunities) { this.opportunities = opportunities; }
    @PostMapping public ApiResponse<Opportunity> create(@Valid @RequestBody OpportunityRequest request) {
        Opportunity o = apply(new Opportunity(), request); o.setPostedBy(CurrentUser.get());
        return ApiResponse.ok("Opportunity posted", opportunities.save(o));
    }
    @GetMapping public ApiResponse<List<Opportunity>> all() { return ApiResponse.ok("Opportunities", opportunities.findAllByOrderByCreatedAtDesc()); }
    @GetMapping("/my") public ApiResponse<List<Opportunity>> my() { return ApiResponse.ok("My opportunities", opportunities.findByPostedByOrderByCreatedAtDesc(CurrentUser.get())); }
    @GetMapping("/{id}") public ApiResponse<Opportunity> one(@PathVariable Long id) { return ApiResponse.ok("Opportunity", get(id)); }
    @PutMapping("/{id}") public ApiResponse<Opportunity> update(@PathVariable Long id, @RequestBody OpportunityRequest request) {
        return ApiResponse.ok("Opportunity updated", opportunities.save(apply(owned(id), request)));
    }
    @PutMapping("/{id}/close") public ApiResponse<Opportunity> close(@PathVariable Long id) {
        Opportunity o = owned(id); o.setStatus(OpportunityStatus.CLOSED);
        return ApiResponse.ok("Opportunity closed", opportunities.save(o));
    }
    @DeleteMapping("/{id}") public ApiResponse<Void> delete(@PathVariable Long id) { opportunities.delete(owned(id)); return ApiResponse.ok("Opportunity deleted", null); }
    private Opportunity get(Long id) { return opportunities.findById(id).orElseThrow(() -> new EntityNotFoundException("Opportunity not found")); }
    private Opportunity owned(Long id) {
        Opportunity o = get(id);
        if (!o.getPostedBy().getId().equals(CurrentUser.get().getId())) throw new IllegalStateException("Not allowed");
        return o;
    }
    private Opportunity apply(Opportunity o, OpportunityRequest r) {
        o.setTitle(r.title()); o.setDescription(r.description()); o.setCategory(r.category()); o.setCity(r.city());
        o.setBudget(r.budget()); o.setContactPreference(r.contactPreference()); return o;
    }
    public record OpportunityRequest(@NotBlank String title, String description, String category, String city, BigDecimal budget, String contactPreference) {}
}
