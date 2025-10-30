package com.socialmedia.chat_service.DTOs;

import com.socialmedia.chat_service.Model.Enums.MessageStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MessageDto {
    private String id;
    private String conversationId;
    private Long senderId;
    private Long receiverId;
    private String content;
    private MessageStatus status;
    private String createdAt;
}
