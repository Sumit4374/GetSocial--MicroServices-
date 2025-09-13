package com.socialmedia.notification_service.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class LikesEventConsumer {
    @Autowired
    private NotificationPublisher publisher;

    @KafkaListener(topics = "like-event",groupId = "like-service-media")
    public void consume(String message){
        System.out.println(message);
        publisher.sendNotification("/topic/likes", message);
    }
}
