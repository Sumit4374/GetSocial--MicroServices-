package com.socialmedia.notification_service.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class PostEventConsumer {
    @Autowired
    private NotificationPublisher publisher;

    @KafkaListener(topics = "post-events" ,groupId = "post-service-media")
    public void consume(String message){
        System.out.println(message);
        publisher.sendNotification("/topic/posts", message);
    }
}
