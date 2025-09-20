package com.socialmedia.chat_service.DTOs;

import lombok.Data;

@Data
public class CreateChatRequest {
    private Long otherUserId;
}
