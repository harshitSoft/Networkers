package com.networkers.eventfee;
import com.networkers.common.ApiResponse;import org.springframework.web.bind.annotation.*;import java.time.LocalDate;import java.util.*;
@RestController @RequestMapping("/api/admin/event-fees") public class EventFeeController{
 private final EventFeeService service;public EventFeeController(EventFeeService s){service=s;}
 @GetMapping public ApiResponse<?> all(@RequestParam(required=false)Integer year,@RequestParam(required=false)Integer month){LocalDate now=LocalDate.now();return ApiResponse.ok("Event fees",service.list(year==null?now.getYear():year,month==null?now.getMonthValue():month).stream().map(this::view).toList());}
 @PutMapping("/{id}/status") public ApiResponse<?> status(@PathVariable Long id,@RequestBody StatusRequest request){return ApiResponse.ok("Payment status updated",view(service.status(id,request.status())));}
 @PostMapping("/{id}/remind") public ApiResponse<?> remind(@PathVariable Long id){service.remind(id);return ApiResponse.ok("Reminder sent",true);}
 @PostMapping("/remind-unpaid") public ApiResponse<?> remindAll(@RequestParam Integer year,@RequestParam Integer month){int count=service.remindAll(year,month);return ApiResponse.ok("Reminder sent to "+count+" unpaid member"+(count==1?"":"s"),Map.of("notified",count));}
 private Map<String,Object> view(EventFee f){Map<String,Object> m=new LinkedHashMap<>();m.put("id",f.getId());m.put("userId",f.getUser().getId());m.put("memberName",f.getUser().getFullName());m.put("email",f.getUser().getEmail());m.put("mobile",f.getUser().getMobile());m.put("amount",f.getAmount());m.put("year",f.getYear());m.put("month",f.getMonth());m.put("status",f.getStatus());m.put("paidAt",f.getPaidAt());m.put("lastReminderDate",f.getLastReminderDate());return m;}
 public record StatusRequest(EventFeeStatus status){}
}
