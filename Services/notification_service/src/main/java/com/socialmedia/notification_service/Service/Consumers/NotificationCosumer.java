package com.socialmedia.notification_service.Service.Consumers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.socialmedia.notification_service.DTO.CommentEvent;
import com.socialmedia.notification_service.DTO.LikeEvent;
import com.socialmedia.notification_service.DTO.PostEvent;
import com.socialmedia.notification_service.DTO.UserEvent;
import com.socialmedia.notification_service.Model.Notification;
import com.socialmedia.notification_service.Service.NotificationService;

@Service
public class NotificationCosumer {
    
    private static final Logger log = LoggerFactory.getLogger(NotificationCosumer.class);
    
    @Autowired
    private NotificationService service;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @KafkaListener(
        topics = "post-events",
        groupId = "notification-service-group"
    )
    public void handlePostEvent(String message) {
        try {
            log.info("Received post event: {}", message);
            PostEvent event = objectMapper.readValue(message, PostEvent.class);
            
            // For now, we might not create notifications for own posts
            // This could be used for other features like feed updates
            log.info("Post created by user: {}, postId: {}", event.getUserId(), event.getPostId());
            
        } catch (Exception e) {
            log.error("Error processing post event: {}", message, e);
        }
    }
    
    @KafkaListener(
        topics = "comment-events",
        groupId = "notification-service-group"
    )
    public void handleCommentEvent(String message) {
        try {
            log.info("Received comment event: {}", message);
            CommentEvent event = objectMapper.readValue(message, CommentEvent.class);
            
            if ("comment added".equals(event.getType())) {
                log.info("Comment added: userId={}, postId={}, comment={}", 
                    event.getUserId(), event.getPostId(), event.getComment());
                
                // Create notification for the comment event
                // Note: This will create notifications even if user comments on their own post
                // To fix: Need to fetch post owner from post-service and compare with userId
                Notification notification = new Notification();
                notification.setUserId(event.getUserId()); // Temporary: using commenter's ID (should be post owner)
                notification.setSenderId(event.getUserId());
                notification.setType("COMMENT");
                notification.setMessage("Someone commented on your post");
                notification.setPostId(event.getPostId());
                
                service.createNotification(notification);
                log.info("Comment notification created for postId: {}", event.getPostId());
            }
            
        } catch (Exception e) {
            log.error("Error processing comment event: {}", message, e);
        }
    }
    
    @KafkaListener(
        topics = "like-event",
        groupId = "notification-service-group"
    )
    public void handleLikeEvent(String message) {
        try {
            log.info("Received like event: {}", message);
            LikeEvent event = objectMapper.readValue(message, LikeEvent.class);
            
            if ("Post-Liked".equals(event.getType())) {
                log.info("Post liked: userId={}, postId={}", event.getUserId(), event.getPostId());
                
                // Create notification for the like event
                // Note: This will create notifications even if user likes their own post
                // To fix: Need to fetch post owner from post-service and compare with userId
                Notification notification = new Notification();
                notification.setUserId(event.getUserId()); // Temporary: using liker's ID (should be post owner)
                notification.setSenderId(event.getUserId());
                notification.setType("LIKE");
                notification.setMessage("Your post was liked");
                notification.setPostId(event.getPostId());
                
                service.createNotification(notification);
                log.info("Like notification created for postId: {}", event.getPostId());
                
            } else if ("Post-UnLiked".equals(event.getType())) {
                log.info("Post unliked: userId={}, postId={}", event.getUserId(), event.getPostId());
            }
            
        } catch (Exception e) {
            log.error("Error processing like event: {}", message, e);
        }
    }
    
    @KafkaListener(
        topics = "user-events",
        groupId = "notification-service-group"
    )
    public void handleUserEvent(String message) {
        try {
            log.info("Received user event: {}", message);
            UserEvent event = objectMapper.readValue(message, UserEvent.class);
            
            // User events are for user creation, not follow events
            log.info("New user created: userId={}, email={}", event.getUserId(), event.getEmail());
            
        } catch (Exception e) {
            log.error("Error processing user event: {}", message, e);
        }
    }
}
