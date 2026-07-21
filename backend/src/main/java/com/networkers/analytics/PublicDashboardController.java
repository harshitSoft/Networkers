package com.networkers.analytics;

import com.networkers.common.ApiResponse;
import com.networkers.common.PageResponse;
import com.networkers.community.CommentRepository;
import com.networkers.community.PostRepository;
import com.networkers.event.*;
import com.networkers.meetingautomation.MeetingParticipantRepository;
import com.networkers.referral.*;
import com.networkers.user.*;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.Month;
import java.util.*;

@RestController @RequestMapping("/api/public-dashboard")
public class PublicDashboardController {
 private final UserRepository users; private final ReferralRepository referrals; private final ReferralRevenueRepository revenues; private final PostRepository posts; private final CommentRepository comments; private final MeetingParticipantRepository meetings; private final EventRsvpRepository rsvps;
 public PublicDashboardController(UserRepository users,ReferralRepository referrals,ReferralRevenueRepository revenues,PostRepository posts,CommentRepository comments,MeetingParticipantRepository meetings,EventRsvpRepository rsvps){this.users=users;this.referrals=referrals;this.revenues=revenues;this.posts=posts;this.comments=comments;this.meetings=meetings;this.rsvps=rsvps;}
 @GetMapping public ApiResponse<DashboardView> dashboard(@RequestParam(defaultValue="0") int page){int safe=Math.max(0,page);List<User> members=new ArrayList<>();members.addAll(users.findByRole(Role.USER));members.addAll(users.findByRole(Role.BUSINESS_USER));members=members.stream().filter(User::isEnabled).distinct().toList();List<RankView> referrers=members.stream().map(u->rank(u,referrals.countByGivenBy(u))).sorted(rankOrder()).toList();List<RankView> active=members.stream().map(u->{long referralPoints=referrals.countByGivenBy(u)*10;long score=referralPoints+safe(()->posts.countKudosGivenBy(u))+safe(()->comments.countByUser(u))*2+safe(()->meetings.countCompletedByMember(u))*5+safe(()->rsvps.countByUserAndStatus(u,EventRsvpStatus.ATTENDED))*7;return rank(u,score);}).sorted(rankOrder()).toList();List<RankView> revenue=members.stream().map(u->rank(u,referrals.totalBusinessGivenBy(u).longValue())).sorted(rankOrder()).toList();List<RevenuePoint> trend=referrals.monthlyNetworkBusiness().stream().map(r->new RevenuePoint(Month.of(((Number)r[1]).intValue()).name().substring(0,3)+" "+((Number)r[0]).intValue(),new BigDecimal(r[2].toString()))).toList();return ApiResponse.ok("Public dashboard",new DashboardView(page(referrers,safe),page(active,safe),page(revenue,safe),referrals.totalNetworkBusiness(),trend));}
 private long safe(java.util.function.LongSupplier value){try{return value.getAsLong();}catch(RuntimeException ignored){return 0;}}
 private RankView rank(User u,long score){return new RankView(u.getId(),u.getFullName(),u.getProfileImage(),u.getBusinessName(),u.getChapter()==null?"":u.getChapter().getChapterName(),score);}
 private Comparator<RankView> rankOrder(){return Comparator.comparingLong(RankView::score).reversed().thenComparing(RankView::name,String.CASE_INSENSITIVE_ORDER);}
 private PageResponse<RankView> page(List<RankView> list,int page){int size=5,start=Math.min(page*size,list.size()),end=Math.min(start+size,list.size());return new PageResponse<>(list.subList(start,end),page,size,list.size(),(int)Math.ceil(list.size()/(double)size));}
 public record RankView(Long userId,String name,String avatar,String businessName,String chapterName,long score){}
 public record RevenuePoint(String label,BigDecimal value){}
 public record DashboardView(PageResponse<RankView> topReferrers,PageResponse<RankView> mostActive,PageResponse<RankView> topRevenueContributors,BigDecimal totalRevenue,List<RevenuePoint> revenueTrend){}
}
