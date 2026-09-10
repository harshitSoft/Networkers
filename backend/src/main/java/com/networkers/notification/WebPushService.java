package com.networkers.notification;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.networkers.user.User;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.apache.http.HttpResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Map;
@Service public class WebPushService{
 private final PushSubscriptionRepository subscriptions;private final ObjectMapper json;private final String publicKey,privateKey,subject;
 public WebPushService(PushSubscriptionRepository s,ObjectMapper j,@Value("${app.push.public-key:}")String pub,@Value("${app.push.private-key:}")String priv,@Value("${app.push.subject:mailto:no-reply@networkers.family}")String subject){subscriptions=s;json=j;publicKey=pub;privateKey=priv;this.subject=subject;}
 public boolean configured(){return publicKey!=null&&!publicKey.isBlank()&&privateKey!=null&&!privateKey.isBlank();}public String publicKey(){return publicKey==null?"":publicKey;}
 public void send(User user,String title,String message,String url){if(!configured())return;for(PushSubscription item:subscriptions.findByUser(user))try{PushService service=new PushService(publicKey,privateKey,subject);String payload=json.writeValueAsString(Map.of("title",title,"body",message,"url",url));HttpResponse response=service.send(new Notification(item.getEndpoint(),item.getPublicKey(),item.getAuth(),payload));int status=response.getStatusLine().getStatusCode();if(status==404||status==410)subscriptions.delete(item);}catch(Exception ignored){}}
}
