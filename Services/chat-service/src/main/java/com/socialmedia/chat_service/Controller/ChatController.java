package com.socialmedia.chat_service.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.socialmedia.chat_service.DTOs.ConversationDto;
import com.socialmedia.chat_service.DTOs.CreateChatRequest;
import com.socialmedia.chat_service.DTOs.MessageDto;
import com.socialmedia.chat_service.DTOs.MessageRequest;
import com.socialmedia.chat_service.Service.ConservationService;
import com.socialmedia.chat_service.Service.MessageService;

@RestController
@RequestMapping("/api/chats")
public class ChatController {
    
    @Autowired
    private ConservationService conversationService;
    
    @Autowired
    private MessageService messageService;
    
    /**
     * Request a chat with another user
     */
    @PostMapping("/request")
    public ResponseEntity<ConversationDto> requestChat(
            @RequestHeader("X-User-Id") Long requesterId,
            @RequestBody CreateChatRequest request) {
        ConversationDto conversation = conversationService.requestChat(requesterId, request.getOtherUserId());
        return ResponseEntity.ok(conversation);
    }
    
    /**
     * Accept a chat request
     */
    @PostMapping("/{conversationId}/accept")
    public ResponseEntity<ConversationDto> acceptChatRequest(
            @PathVariable String conversationId,
            @RequestHeader("X-User-Id") Long accepterId) {
        ConversationDto conversation = conversationService.acceptRequest(conversationId, accepterId);
        return ResponseEntity.ok(conversation);
    }
    
    /**
     * Get all conversations for a user (active only)
     */
    @GetMapping
    public ResponseEntity<List<ConversationDto>> getConversations(
            @RequestHeader("X-User-Id") Long userId) {
        List<ConversationDto> conversations = conversationService.getUserConversations(userId);
        return ResponseEntity.ok(conversations);
    }
    
    /**
     * Get pending chat requests for a user
     */
    @GetMapping("/requests/pending")
    public ResponseEntity<List<ConversationDto>> getPendingRequests(
            @RequestHeader("X-User-Id") Long userId) {
        List<ConversationDto> requests = conversationService.getPendingRequests(userId);
        return ResponseEntity.ok(requests);
    }
    
    /**
     * Get messages for a conversation
     */
    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<List<MessageDto>> getMessages(
            @PathVariable String conversationId,
            @RequestHeader("X-User-Id") Long userId) {
        // Verify user is part of conversation
        conversationService.verifyParticipant(conversationId, userId);
        List<MessageDto> messages = messageService.getConversationMessages(conversationId);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * Send a message
     */
    @PostMapping("/message")
    public ResponseEntity<MessageDto> sendMessage(
            @RequestHeader("X-User-Id") Long senderId,
            @RequestBody MessageRequest request) {
        MessageDto message = messageService.sendMessage(senderId, request.getConversationId(), request.getContent());
        return ResponseEntity.ok(message);
    }
    
    /**
     * Get conversation details
     */
    @GetMapping("/{conversationId}")
    public ResponseEntity<ConversationDto> getConversation(
            @PathVariable String conversationId,
            @RequestHeader("X-User-Id") Long userId) {
        conversationService.verifyParticipant(conversationId, userId);
        ConversationDto conversation = conversationService.getConversation(conversationId);
        return ResponseEntity.ok(conversation);
    }
}
