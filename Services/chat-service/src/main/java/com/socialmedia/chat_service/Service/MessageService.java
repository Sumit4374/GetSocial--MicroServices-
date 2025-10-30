package com.socialmedia.chat_service.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.socialmedia.chat_service.DTOs.MessageDto;
import com.socialmedia.chat_service.Model.ChatModel;
import com.socialmedia.chat_service.Model.MessageModel;
import com.socialmedia.chat_service.Model.Enums.ConversationStatus;
import com.socialmedia.chat_service.Model.Enums.MessageStatus;
import com.socialmedia.chat_service.Repository.ChatRepository;
import com.socialmedia.chat_service.Repository.MessageRepository;

@Service
public class MessageService {
    
    @Autowired
    private MessageRepository messageRepo;
    @Autowired
    private ChatRepository chatRepo;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private KafkaTemplate<String,String> template;
    @Autowired
    private ObjectMapper objectMapper;

    public MessageDto sendMessage(Long senderId, String conversationId, String content){
        ChatModel conv = chatRepo.findById(conversationId)
                        .orElseThrow(()-> new RuntimeException("Conversation not found"));
        if(!(conv.getUserA().equals(senderId) || conv.getUserB().equals(senderId))){
            throw new RuntimeException("Sender is not a participant");
        }
        if(conv.getStatus()!=ConversationStatus.ACTIVE){
            throw new RuntimeException("Conversation is not active");
        }

        Long receiverId = conv.getUserA().equals(senderId)? conv.getUserB():conv.getUserA();

        MessageModel msg = MessageModel.builder()
                        .id(UUID.randomUUID().toString())
                        .conversationId(conversationId)
                        .senderId(senderId)
                        .receiverId(receiverId)
                        .status(MessageStatus.SENT)
                        .content(content)
                        .createdAt(LocalDateTime.now())
                        .build();
        
        MessageModel saved = messageRepo.save(msg);
        String dest = "/topic/user/" + receiverId + "/chat";
        MessageDto dto = toDto(saved);
        messagingTemplate.convertAndSend(dest,dto);
        try {
            template.send("chat-events",objectMapper.writeValueAsString(dto));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return dto;
    }

    public List<MessageDto> getConversationMessages(String conversartionId){
        return messageRepo.findByConversationIdOrderByCreatedAtAsc(conversartionId).stream().map(this::toDto).toList();
    }

    private MessageDto toDto(MessageModel msg){
        String createdAtStr = null;
        if (msg.getCreatedAt() != null) {
            ZonedDateTime zdt = ZonedDateTime.of(msg.getCreatedAt(), ZoneId.systemDefault())
                                            .withZoneSameInstant(ZoneOffset.UTC);
            createdAtStr = DateTimeFormatter.ISO_INSTANT.format(zdt);
        }
        return MessageDto.builder()
            .id(msg.getId())
            .conversationId(msg.getConversationId())
            .senderId(msg.getSenderId())
            .receiverId(msg.getReceiverId())
            .content(msg.getContent())
            .status(msg.getStatus())
            .createdAt(createdAtStr)
            .build();
    }
}
