package com.networkers.visitor;

import com.networkers.common.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@RestController @RequestMapping("/api/admin/visitors")
public class VisitorController {
    private final VisitorRepository visitors;
    public VisitorController(VisitorRepository visitors){this.visitors=visitors;}
    @GetMapping public ApiResponse<?> all(){return ApiResponse.ok("Visitors",visitors.findAllByOrderByCreatedAtDesc());}
    @PostMapping public ApiResponse<?> create(@RequestBody VisitorRequest request){Visitor visitor=new Visitor();apply(visitor,request);return ApiResponse.ok("Visitor registered",visitors.save(visitor));}
    @PutMapping("/{id}") public ApiResponse<?> update(@PathVariable Long id,@RequestBody VisitorRequest request){Visitor visitor=find(id);apply(visitor,request);return ApiResponse.ok("Visitor updated",visitors.save(visitor));}
    @PutMapping("/{id}/confirm-payment") public ApiResponse<?> confirmPayment(@PathVariable Long id){Visitor visitor=find(id);visitor.setPaymentConfirmed(true);return ApiResponse.ok("Visitor payment confirmed",visitors.save(visitor));}
    @DeleteMapping("/{id}") public ApiResponse<?> delete(@PathVariable Long id){visitors.delete(find(id));return ApiResponse.ok("Visitor deleted",true);}
    private Visitor find(Long id){return visitors.findById(id).orElseThrow(()->new EntityNotFoundException("Visitor not found"));}
    private void apply(Visitor visitor,VisitorRequest request){if(request.fullName()==null||request.fullName().isBlank()||request.fullName().trim().length()<2||request.fullName().trim().length()>100)throw new IllegalArgumentException("Visitor name must be between 2 and 100 characters");if(request.mobile()==null||!request.mobile().matches("^\\d{10}$"))throw new IllegalArgumentException("Enter a valid 10-digit mobile number");if(request.email()!=null&&!request.email().isBlank()&&!request.email().trim().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"))throw new IllegalArgumentException("Enter a valid email address");if(request.visitDate()==null)throw new IllegalArgumentException("Visit date is required");if(request.paymentAmount()==null||request.paymentAmount().signum()<0||request.paymentAmount().scale()>2||request.paymentAmount().compareTo(new BigDecimal("9999999999.99"))>0)throw new IllegalArgumentException("Enter a valid payment amount with at most 2 decimal places");visitor.setFullName(request.fullName().trim());visitor.setMobile(request.mobile());visitor.setEmail(clean(request.email()));visitor.setBusinessName(clean(request.businessName()));visitor.setCity(clean(request.city()));visitor.setPurpose(clean(request.purpose()));visitor.setPersonToMeet(clean(request.personToMeet()));visitor.setVisitDate(request.visitDate());visitor.setPaymentAmount(request.paymentAmount());visitor.setNotes(clean(request.notes()));}
    private String clean(String value){return value==null||value.isBlank()?null:value.trim();}
    public record VisitorRequest(String fullName,String mobile,String email,String businessName,String city,String purpose,String personToMeet,LocalDate visitDate,BigDecimal paymentAmount,String notes){}
}
