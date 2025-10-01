package com.socialmedia.post_service.DTO;

import lombok.Data;

@Data
public class UserBasicsResponse {
    private Long id;
    private String username;
    private String profilePicUrl;
}
