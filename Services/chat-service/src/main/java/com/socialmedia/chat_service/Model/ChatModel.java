package com.socialmedia.chat_service.Model;

import java.time.LocalDateTime;

import com.socialmedia.chat_service.Model.Enums.ConversationStatus;

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
@Table(name = "conversation")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatModel {
    @Id
    @Column(nullable = false, updatable = false)
    private String id;

    private Long userA;
    private Long userB;

    @Enumerated(EnumType.STRING)
    private ConversationStatus status;

    private LocalDateTime createdAt;
    

}
