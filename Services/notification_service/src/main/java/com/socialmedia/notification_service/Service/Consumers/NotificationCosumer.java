package com.socialmedia.notification_service.Service.Consumers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.socialmedia.notification_service.Client.PostServiceClient;
import com.socialmedia.notification_service.Client.UserServiceClient;
import com.socialmedia.notification_service.DTO.CommentEvent;
import com.socialmedia.notification_service.DTO.LikeEvent;
import com.socialmedia.notification_service.DTO.PostDTO;
import com.socialmedia.notification_service.DTO.PostEvent;
import com.socialmedia.notification_service.DTO.UserDTO;
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
    
    @Autowired
    private PostServiceClient postServiceClient;
    
    @Autowired
    private UserServiceClient userServiceClient;
    
    @KafkaListener(
        topics = "post-events",
        groupId = "notification-service-group"
    )
    public void handlePostEvent(String message) {
        try {
            log.info("Received post event: {}", message);
            PostEvent event = objectMapper.readValue(message, PostEvent.class);
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
            
            if ("Comment added".equals(event.getType())) {
                log.info("Comment added: userId={}, postId={}, comment={}", 
                    event.getUserId(), event.getPostId(), event.getComment());
                
                // Fetch post details to get the post owner
                try {
                    PostDTO post = postServiceClient.getPostById(event.getPostId());
                    
                    if (post != null && post.getUserId() != null) {
                        // Don't notify if user comments on their own post
                        if (!post.getUserId().equals(event.getUserId())) {
                            // Fetch the commenter's username
                            UserDTO commenter = userServiceClient.getUserById(event.getUserId());
                            
                            String username = (commenter != null && commenter.getUsername() != null) 
                                ? commenter.getUsername() 
                                : "Someone";
                            
                            // Create notification for the post owner
                            Notification notification = new Notification();
                            notification.setUserId(post.getUserId()); // Post owner receives notification
                            notification.setSenderId(event.getUserId()); // Commenter is the sender
                            notification.setType("COMMENT");
                            notification.setMessage(username + " commented on your post");
                            notification.setPostId(event.getPostId());
                            
                            service.createNotification(notification);
                            log.info("Comment notification created for post owner userId: {}", post.getUserId());
                        } else {
                            log.info("Skipping notification - user commented on their own post");
                        }
                    }
                } catch (Exception e) {
                    log.error("Error fetching post or user details for comment notification", e);
                }
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
                
                // Fetch post details to get the post owner
                try {
                    PostDTO post = postServiceClient.getPostById(event.getPostId());
                    
                    if (post != null && post.getUserId() != null) {
                        // Don't notify if user likes their own post
                        if (!post.getUserId().equals(event.getUserId())) {
                            // Fetch the liker's username
                            UserDTO liker = userServiceClient.getUserById(event.getUserId());
                            
                            String username = (liker != null && liker.getUsername() != null) 
                                ? liker.getUsername() 
                                : "Someone";
                            
                            // Create notification for the post owner
                            Notification notification = new Notification();
                            notification.setUserId(post.getUserId()); // Post owner receives notification
                            notification.setSenderId(event.getUserId()); // Liker is the sender
                            notification.setType("LIKE");
                            notification.setMessage(username + " liked your post");
                            notification.setPostId(event.getPostId());
                            
                            service.createNotification(notification);
                            log.info("Like notification created for post owner userId: {}", post.getUserId());
                        } else {
                            log.info("Skipping notification - user liked their own post");
                        }
                    }
                } catch (Exception e) {
                    log.error("Error fetching post or user details for like notification", e);
                }
                
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
