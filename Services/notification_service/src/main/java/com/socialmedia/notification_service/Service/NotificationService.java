package com.socialmedia.notification_service.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.socialmedia.notification_service.Model.Notification;
import com.socialmedia.notification_service.Repository.NotificationRepository;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository repository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    public Notification createNotification(Notification notification) {
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        Notification saved = repository.save(notification);
        
        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSend(
            "/topic/user/" + notification.getUserId() + "/notifications", 
            saved
        );
        
        return saved;
    }
    
    public List<Notification> getUserNotifications(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public List<Notification> getUnreadNotifications(Long userId) {
        return repository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }
    
    public long getUnreadCount(Long userId) {
        return repository.countByUserIdAndReadFalse(userId);
    }
    
    public Notification markAsRead(Long notificationId) {
        Notification notification = repository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return repository.save(notification);
    }
    
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = repository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        repository.saveAll(notifications);
    }
}
