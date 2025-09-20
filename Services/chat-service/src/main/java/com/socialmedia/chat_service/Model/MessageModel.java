package com.socialmedia.chat_service.Model;

import java.time.LocalDateTime;

import com.socialmedia.chat_service.Model.Enums.MessageStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "messages")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageModel {
    @Id
    @Column(nullable = false, updatable = false)
    private String id;

    @Column(nullable = false)
    private String conversationId;

    private Long senderId;
    private Long receiverId;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private MessageStatus status;

    private LocalDateTime createdAt;
}
