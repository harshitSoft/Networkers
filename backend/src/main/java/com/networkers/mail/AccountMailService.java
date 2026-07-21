package com.networkers.mail;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class AccountMailService {
    private final JavaMailSender sender;
    @Value("${app.mail.from}") private String from;
    public AccountMailService(JavaMailSender sender){this.sender=sender;}
    public void sendApproval(String name,String email,String password){
        try{
            MimeMessage message=sender.createMimeMessage(); MimeMessageHelper helper=new MimeMessageHelper(message,true,"UTF-8");
            helper.setFrom(from,"Networkers");helper.setTo(email);helper.setSubject("Your Networkers account has been approved");
            helper.setText(template(name,email,password),true);sender.send(message);
        }catch(Exception e){throw new IllegalStateException("Account created, but credential email could not be sent: "+e.getMessage(),e);}
    }
    public void sendSubscriptionReminder(String name,String email,String plan,String endDate,long days){
        try{MimeMessage message=sender.createMimeMessage();MimeMessageHelper helper=new MimeMessageHelper(message,true,"UTF-8");helper.setFrom(from,"Networkers");helper.setTo(email);helper.setSubject("Your Networkers subscription renews soon");helper.setText("""
        <html><body style='margin:0;background:#0A0A0A;font-family:Arial;color:#F7F7F7;padding:30px'><div style='max-width:600px;margin:auto;background:#111;border:1px solid #8B0000;border-radius:18px;overflow:hidden'><div style='padding:28px;background:#E10600'><h1 style='margin:0'>Networkers</h1></div><div style='padding:32px'><p style='color:#FF4D4D;font-weight:bold'>SUBSCRIPTION REMINDER</p><h2>Hello, %s</h2><p style='color:#B3B3B3;line-height:1.7'>Your %s subscription is due for renewal in <strong style='color:#FF4D4D'>%d days</strong>.</p><div style='background:#0A0A0A;border-left:3px solid #E10600;padding:18px;margin:22px 0'>Current end date: <strong>%s</strong></div><p>Please contact the Networkers admin to continue uninterrupted access.</p></div></div></body></html>
        """.formatted(name,plan==null||plan.isBlank()?"Networkers":plan,days,endDate),true);sender.send(message);}catch(Exception e){throw new IllegalStateException("Could not send subscription reminder",e);}
    }
    public void sendEventInvitation(String name,String email,String title,String date,String time,String venue,String chapter,String description){
        try{MimeMessage message=sender.createMimeMessage();MimeMessageHelper helper=new MimeMessageHelper(message,true,"UTF-8");helper.setFrom(from,"Networkers Events");helper.setTo(email);helper.setSubject("You're invited: "+title);helper.setText("""
        <html><body style='margin:0;background:#0A0A0A;font-family:Arial;color:#F7F7F7;padding:30px'><div style='max-width:620px;margin:auto;background:#111;border:1px solid #8B0000;border-radius:20px;overflow:hidden'><div style='padding:32px;background:linear-gradient(135deg,#E10600,#8B0000)'><p style='margin:0 0 8px;font-size:12px;letter-spacing:2px'>NETWORKERS EVENT</p><h1 style='margin:0;color:white'>%s</h1></div><div style='padding:34px'><h2 style='color:white'>Hello %s, you're invited.</h2><p style='color:#B3B3B3;line-height:1.7'>%s</p><div style='margin:24px 0;background:#0A0A0A;border-left:3px solid #FF1E1E;padding:20px;border-radius:8px'><p><b style='color:#FF4D4D'>Date:</b> %s</p><p><b style='color:#FF4D4D'>Time:</b> %s</p><p><b style='color:#FF4D4D'>Venue:</b> %s</p><p><b style='color:#FF4D4D'>Chapter:</b> %s</p></div><p style='color:#F0F0F0'>Open your Networkers dashboard for event details and updates.</p></div><div style='border-top:1px solid #1E1E1E;padding:18px 34px;color:#888;font-size:12px'>Networkers · Connect. Refer. Grow.</div></div></body></html>
        """.formatted(title,name,description==null||description.isBlank()?"A new networking event has been created for you.":description,date,time,venue==null||venue.isBlank()?"To be announced":venue,chapter),true);sender.send(message);}catch(Exception e){throw new IllegalStateException("Could not send event invitation",e);}
    }
    public void sendPasswordOtp(String name,String email,String otp,String action){
        try{MimeMessage message=sender.createMimeMessage();MimeMessageHelper helper=new MimeMessageHelper(message,true,"UTF-8");helper.setFrom(from,"Networkers Security");helper.setTo(email);helper.setSubject("Your Networkers password OTP");helper.setText("""
        <html><body style='margin:0;background:#0A0A0A;font-family:Arial;color:#F7F7F7;padding:30px'><div style='max-width:600px;margin:auto;background:#111;border:1px solid #8B0000;border-radius:18px;overflow:hidden'><div style='padding:28px;background:#E10600'><h1 style='margin:0'>Networkers</h1></div><div style='padding:32px'><p style='color:#FF4D4D;font-weight:bold'>PASSWORD SECURITY</p><h2>Hello, %s</h2><p style='color:#B3B3B3;line-height:1.7'>Use this one-time password to %s. It expires in 10 minutes.</p><div style='background:#0A0A0A;border:1px solid #E10600;padding:20px;margin:24px 0;text-align:center;border-radius:10px;font-size:32px;font-weight:bold;letter-spacing:8px;color:#FF4D4D'>%s</div><p style='color:#888;font-size:13px'>If you did not request this, you can safely ignore this email. Never share this OTP with anyone.</p></div></div></body></html>
        """.formatted(name==null||name.isBlank()?"Member":name,action,otp),true);sender.send(message);}catch(Exception e){throw new IllegalStateException("Could not send password OTP",e);}
    }
    private String template(String name,String email,String password){return """
      <!doctype html><html><body style='margin:0;background:#0A0A0A;font-family:Arial,sans-serif;color:#F7F7F7'>
      <table width='100%%' cellpadding='0' cellspacing='0' style='background:#0A0A0A;padding:36px 12px'><tr><td align='center'>
      <table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;background:#111;border:1px solid #8B0000;border-radius:20px;overflow:hidden'>
      <tr><td style='padding:32px;background:linear-gradient(135deg,#E10600,#8B0000)'><h1 style='margin:0;color:#fff'>Network<span style='color:#0A0A0A'>ers</span></h1><p style='margin:8px 0 0;color:#fff'>Connect. Refer. Grow.</p></td></tr>
      <tr><td style='padding:36px'><p style='color:#FF4D4D;font-weight:bold;text-transform:uppercase;letter-spacing:1px'>Request approved</p><h2 style='color:#fff'>Welcome, %s</h2><p style='color:#B3B3B3;line-height:1.7'>Your account creation request has been approved by Networkers. Use the credentials below to sign in.</p>
      <div style='background:#0A0A0A;border-left:3px solid #E10600;border-radius:10px;padding:20px;margin:24px 0'><p style='margin:0 0 10px;color:#888'>Login ID</p><p style='margin:0 0 18px;color:#fff;font-weight:bold'>%s</p><p style='margin:0 0 10px;color:#888'>Temporary password</p><p style='margin:0;color:#FF4D4D;font-weight:bold'>%s</p></div>
      <p style='color:#F0F0F0;line-height:1.7'><strong>For your security, please log in and change your password immediately.</strong></p></td></tr>
      <tr><td style='padding:20px 36px;border-top:1px solid #1E1E1E;color:#888;font-size:12px'>© 2026 Networkers · Trusted business growth</td></tr></table>
      </td></tr></table></body></html>
      """.formatted(name,email,password);}
}
