package com.networkers.admin;

import com.networkers.user.User;
import com.networkers.user.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDeletionService {
    private final EntityManager entityManager;
    private final UserRepository users;

    public UserDeletionService(EntityManager entityManager, UserRepository users) {
        this.entityManager = entityManager;
        this.users = users;
    }

    @Transactional
    public void permanentlyDelete(User user) {
        Long id = user.getId();

        // Preserve other members' meetings by transferring host ownership when possible.
        execute("update monthly_meeting_groups g set host_id=(select p.member_id from monthly_meeting_participants p where p.group_id=g.id and p.member_id<>:id order by p.id limit 1) where g.host_id=:id and exists (select 1 from monthly_meeting_participants p where p.group_id=g.id and p.member_id<>:id)", id);

        // Remove monthly-meeting content owned by groups hosted by this member.
        execute("delete from comment where post_id in (select p.id from post p join monthly_meetings m on p.meeting_id=m.id join monthly_meeting_groups g on m.group_id=g.id where g.host_id=:id)", id);
        execute("delete from post_mentions where post_id in (select p.id from post p join monthly_meetings m on p.meeting_id=m.id join monthly_meeting_groups g on m.group_id=g.id where g.host_id=:id)", id);
        execute("delete from post_kudos where post_id in (select p.id from post p join monthly_meetings m on p.meeting_id=m.id join monthly_meeting_groups g on m.group_id=g.id where g.host_id=:id)", id);
        execute("delete from post where meeting_id in (select m.id from monthly_meetings m join monthly_meeting_groups g on m.group_id=g.id where g.host_id=:id)", id);
        execute("delete from monthly_meeting_comments where meeting_id in (select m.id from monthly_meetings m join monthly_meeting_groups g on m.group_id=g.id where g.host_id=:id)", id);
        execute("delete from monthly_meeting_participants where group_id in (select id from monthly_meeting_groups where host_id=:id)", id);
        execute("delete from monthly_meetings where group_id in (select id from monthly_meeting_groups where host_id=:id)", id);
        execute("delete from monthly_meeting_groups where host_id=:id", id);

        // Remove the member's remaining community activity and references to their name.
        execute("delete from comment where user_id=:id or post_id in (select id from post where user_id=:id)", id);
        execute("delete from post_mentions where user_id=:id or post_id in (select id from post where user_id=:id)", id);
        execute("delete from post_kudos where user_id=:id or post_id in (select id from post where user_id=:id)", id);
        execute("delete from post where user_id=:id", id);

        execute("delete from monthly_meeting_comments where author_id=:id", id);
        execute("delete from monthly_meeting_participants where member_id=:id", id);
        execute("delete from event_rsvps where user_id=:id", id);
        execute("delete from notification where user_id=:id", id);
        execute("delete from password_otp where user_id=:id", id);
        execute("delete from business_profile where user_id=:id", id);
        execute("delete from opportunity where posted_by_id=:id", id);
        execute("delete from connection where sender_id=:id or receiver_id=:id", id);

        // Delete referrals and their revenue rows before deleting open referral posts.
        execute("delete from referral_revenue where giver_id=:id or receiver_id=:id or referral_id in (select r.id from referral r where r.given_by_id=:id or r.received_by_id=:id or r.open_referral_post_id in (select o.id from open_referral_post o where o.posted_by_id=:id))", id);
        execute("delete from referral where given_by_id=:id or received_by_id=:id or open_referral_post_id in (select id from open_referral_post where posted_by_id=:id)", id);
        execute("delete from open_referral_post where posted_by_id=:id", id);

        execute("delete from meeting_request where requester_id=:id or receiver_id=:id or meetup_id in (select id from meetup where created_by_id=:id)", id);
        execute("delete from meetup_attendee where user_id=:id or meetup_id in (select id from meetup where created_by_id=:id)", id);
        execute("delete from meetup where created_by_id=:id", id);

        entityManager.flush();
        entityManager.clear();
        users.deleteById(id);
        users.flush();
    }

    private void execute(String sql, Long id) {
        entityManager.createNativeQuery(sql).setParameter("id", id).executeUpdate();
    }
}
