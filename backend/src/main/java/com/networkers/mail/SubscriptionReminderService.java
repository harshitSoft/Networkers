package com.networkers.mail;
import com.networkers.user.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
@Service
public class SubscriptionReminderService {
    private final UserRepository users; private final AccountMailService mail;
    public SubscriptionReminderService(UserRepository users,AccountMailService mail){this.users=users;this.mail=mail;}
    @Scheduled(cron="0 0 9 * * *",zone="Asia/Kolkata")
    public void remind(){LocalDate today=LocalDate.now();users.findByEnabledTrueAndDeletedFalseAndSubscriptionEndDateBetween(today,today.plusDays(7)).forEach(user->{long days=ChronoUnit.DAYS.between(today,user.getSubscriptionEndDate());try{mail.sendSubscriptionReminder(user.getFullName(),user.getEmail(),user.getSubscriptionPlan(),user.getSubscriptionEndDate().toString(),days);}catch(Exception ignored){}});}
}
