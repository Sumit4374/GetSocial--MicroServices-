package com.socialmedia.notification_service.Service.Consumers;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.socialmedia.notification_service.Model.Notification;
import com.socialmedia.notification_service.Service.NotificationService;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class NotificationCosumer {
    
    private final NotificationService service;

    public NotificationCosumer(NotificationService service){
        this.service = service;
    }

    @KafkaListener(topics = {"comment-events", "like-event", "post-events", "user-events"})
    public void listens(ConsumerRecord<String, Notification> record) {
        try {
            log.info("Received notification: {}", record.value());
            Notification notification = record.value();
            service.createNotification(notification);
            log.info("Notification processed successfully for user: {}", notification.getUserId());
        } catch (Exception e) {
            log.error("Failed to process notification: {}", e.getMessage(), e);
        }
    }
}
