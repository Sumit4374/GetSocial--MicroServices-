package com.socialmedia.chat_service.DTOs;

import java.time.LocalDateTime;

import com.socialmedia.chat_service.Model.Enums.ConversationStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConversationDto {
    private String id;
    private Long userA;
    private Long userB;
    private ConversationStatus status;
    private LocalDateTime createdAt;
}
