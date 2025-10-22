package com.socialmedia.notification_service.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class LikeEvent {
    private String type; // "Post-Liked" or "Post-UnLiked"
    private Long postId;
    private Long userId;
    
    public LikeEvent() {}
    
    public LikeEvent(String type, Long postId, Long userId) {
        this.type = type;
        this.postId = postId;
        this.userId = userId;
    }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
