package com.socialmedia.chat_service.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.socialmedia.chat_service.Client.UserClient;
import com.socialmedia.chat_service.DTOs.ConversationDto;
import com.socialmedia.chat_service.Model.ChatModel;
import com.socialmedia.chat_service.Model.Enums.ConversationStatus;
import com.socialmedia.chat_service.Repository.ChatRepository;

@Service
public class ConservationService {
    @Autowired
    private ChatRepository chatRepo;
    @Autowired
    private UserClient client;

    public ConversationDto requestChat(Long requesterId, Long otherUserId){
        Optional<ChatModel> existing = chatRepo.findByUserAAndUserB(requesterId, otherUserId);
        if(existing.isPresent()){
            throw new RuntimeException("Conversation Already Exists");
        }
        boolean requesterFollows = Boolean.TRUE.equals(client.isFollowing(requesterId,otherUserId));
        boolean otherFollows = Boolean.TRUE.equals(client.isFollowing(otherUserId, requesterId));
        
        ChatModel conv = ChatModel.builder()
                                .id(UUID.randomUUID().toString())
                                .userA(requesterId)
                                .userB(otherUserId)
                                .createdAt(LocalDateTime.now())
                                .build();
        

        if(requesterFollows && otherFollows){
            conv.setStatus(ConversationStatus.ACTIVE);
        }else{
            conv.setStatus(ConversationStatus.REQUESTED);
        }
        chatRepo.save(conv);
        return toDto(conv);
    }

    public ConversationDto acceptRequest(String conversationId, Long accepterId){
        ChatModel conv = chatRepo.findById(conversationId).orElseThrow(
            ()-> new RuntimeException("No Conversation")
        );
        if(!(conv.getUserA().equals(accepterId)|| conv.getUserB().equals(accepterId))){
            throw new RuntimeException("Not a participant");
        }
        conv.setStatus(ConversationStatus.ACTIVE);
        chatRepo.save(conv);
        return toDto(conv);
    }

    public List<ConversationDto> getUserConversations(Long userId) {
        List<ChatModel> conversations = chatRepo.findByUserAOrUserBOrderByCreatedAtDesc(userId, userId);
        return conversations.stream()
                .filter(conv -> conv.getStatus() == ConversationStatus.ACTIVE)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<ConversationDto> getPendingRequests(Long userId) {
        List<ChatModel> conversations = chatRepo.findByUserAOrUserBOrderByCreatedAtDesc(userId, userId);
        return conversations.stream()
                .filter(conv -> conv.getStatus() == ConversationStatus.REQUESTED 
                        && conv.getUserB().equals(userId))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ConversationDto getConversation(String conversationId) {
        ChatModel conv = chatRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        return toDto(conv);
    }

    public void verifyParticipant(String conversationId, Long userId) {
        ChatModel conv = chatRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!(conv.getUserA().equals(userId) || conv.getUserB().equals(userId))) {
            throw new RuntimeException("User is not a participant of this conversation");
        }
    }

    private ConversationDto toDto(ChatModel chat){
        ConversationDto conversationDto = ConversationDto.builder()
            .id(chat.getId()).userA(chat.getUserA()).userB(chat.getUserB())
                .status(chat.getStatus()).createdAt(chat.getCreatedAt()).build();
        return conversationDto;
    }
}
