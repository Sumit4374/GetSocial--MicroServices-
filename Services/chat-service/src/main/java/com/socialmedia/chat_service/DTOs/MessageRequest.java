package com.socialmedia.chat_service.DTOs;

import lombok.Data;

@Data
public class MessageRequest {
    private String conversationId;
    private String content;
}
