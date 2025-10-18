package com.socialmedia.notification_service.Service.Consumers;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.socialmedia.notification_service.Model.Notification;
import com.socialmedia.notification_service.Service.NotificationService;

@Component
public class NotificationCosumer {
    
    private NotificationService service;

    public NotificationCosumer(NotificationService service){
        this.service=service;
    }

    @KafkaListener(topics = {"comment-events","like-event","post-events","user-events"})
    public void listens(ConsumerRecord<String,Notification> record){
        System.out.println(record.toString());
    }
}
