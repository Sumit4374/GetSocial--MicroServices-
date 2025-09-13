package com.socialmedia.notification_service.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationPublisher {
    @Autowired
    private SimpMessagingTemplate template;

    public NotificationPublisher(SimpMessagingTemplate template){
        this.template=template;
    }
    public void sendNotification(String destination,String message){
        template.convertAndSend(destination,message);
    }
}
