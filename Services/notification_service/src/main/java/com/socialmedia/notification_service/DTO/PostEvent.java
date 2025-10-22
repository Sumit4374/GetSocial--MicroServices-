package com.socialmedia.notification_service.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PostEvent {
    private Long postId;
    private Long userId;
    private String caption;
    
    public PostEvent() {}
    
    public PostEvent(Long postId, Long userId, String caption) {
        this.postId = postId;
        this.userId = userId;
        this.caption = caption;
    }
    
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }
}
