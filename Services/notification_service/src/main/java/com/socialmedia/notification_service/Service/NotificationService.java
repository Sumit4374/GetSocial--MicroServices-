package com.socialmedia.notification_service.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.socialmedia.notification_service.Client.UserServiceClient;
import com.socialmedia.notification_service.DTO.UserDTO;
import com.socialmedia.notification_service.Model.Notification;
import com.socialmedia.notification_service.Repository.NotificationRepository;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository repository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private UserServiceClient userServiceClient;
    
    public Notification createNotification(Notification notification) {
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        Notification saved = repository.save(notification);
        
        // Populate sender details before sending via WebSocket
        populateSenderDetails(saved);
        
        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSend(
            "/topic/user/" + notification.getUserId() + "/notifications", 
            saved
        );
        
        return saved;
    }
    
    public List<Notification> getUserNotifications(Long userId) {
        List<Notification> notifications = repository.findByUserIdOrderByCreatedAtDesc(userId);
        // Populate sender details for each notification
        notifications.forEach(this::populateSenderDetails);
        return notifications;
    }
    
    public List<Notification> getUnreadNotifications(Long userId) {
        List<Notification> notifications = repository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        // Populate sender details for each notification
        notifications.forEach(this::populateSenderDetails);
        return notifications;
    }
    
    public long getUnreadCount(Long userId) {
        return repository.countByUserIdAndReadFalse(userId);
    }
    
    public Notification markAsRead(Long notificationId) {
        Notification notification = repository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        Notification saved = repository.save(notification);
        // Populate sender details
        populateSenderDetails(saved);
        return saved;
    }
    
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = repository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        repository.saveAll(notifications);
    }
    
    private void populateSenderDetails(Notification notification) {
        if (notification.getSenderId() != null) {
            try {
                UserDTO sender = userServiceClient.getUserById(notification.getSenderId());
                if (sender != null) {
                    notification.setSenderUsername(sender.getUsername());
                    notification.setSenderProfilePicture(sender.getProfilePicURL());
                }
            } catch (Exception e) {
                // Log error but don't fail the notification retrieval
                System.err.println("Failed to fetch sender details for senderId: " + notification.getSenderId());
            }
        }
    }
}
