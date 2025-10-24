package com.socialmedia.notification_service.Model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "notifications")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private Long senderId;
    private String type; // Comment/Like/Follow
    private String message;
    private Long postId;
    private Boolean read = false;
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Transient
    private String senderUsername;
    
    @Transient
    private String senderProfilePicture;
    
    public Notification() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
    
    public Boolean getRead() { return read; }
    public void setRead(Boolean read) { this.read = read; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public String getSenderUsername() { return senderUsername; }
    public void setSenderUsername(String senderUsername) { this.senderUsername = senderUsername; }
    
    public String getSenderProfilePicture() { return senderProfilePicture; }
    public void setSenderProfilePicture(String senderProfilePicture) { this.senderProfilePicture = senderProfilePicture; }
}
