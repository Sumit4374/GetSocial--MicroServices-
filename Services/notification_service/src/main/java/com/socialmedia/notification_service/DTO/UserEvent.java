package com.socialmedia.notification_service.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class UserEvent {
    @JsonProperty("UserId")
    private String userId;
    
    @JsonProperty("Email")
    private String email;
    
    public UserEvent() {}
    
    public UserEvent(String userId, String email) {
        this.userId = userId;
        this.email = email;
    }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
