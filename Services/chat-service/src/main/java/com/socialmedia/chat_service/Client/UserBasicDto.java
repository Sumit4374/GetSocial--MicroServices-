package com.socialmedia.chat_service.Client;

import lombok.Data;

@Data
public class UserBasicDto {
    private Long Id;
    private String usrname;
    private String profilePicUrl;
}
