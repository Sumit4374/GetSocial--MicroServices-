package com.socialmedia.notification_service.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class UserDTO {
    private Long id;
    private Long userId;
    private String username;
    private String name;
    private String bio;
    private String profilePicURL;
    
    public UserDTO() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public String getProfilePicURL() { return profilePicURL; }
    public void setProfilePicURL(String profilePicURL) { this.profilePicURL = profilePicURL; }
}
