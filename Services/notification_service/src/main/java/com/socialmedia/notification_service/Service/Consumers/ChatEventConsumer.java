package com.socialmedia.notification_service.Service.Consumers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.socialmedia.notification_service.DTO.ChatMessageEvent;

@Service
public class ChatEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(ChatEventConsumer.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = "chat-events", groupId = "notification-service-group")
    public void handleChatEvent(String message) {
        try {
            ChatMessageEvent event = objectMapper.readValue(message, ChatMessageEvent.class);
            if (event.getReceiverId() == null) {
                log.warn("Chat event missing receiverId: {}", message);
                return;
            }
            // Relay to the user's chat topic
            String destination = "/topic/user/" + event.getReceiverId() + "/chat";
            messagingTemplate.convertAndSend(destination, event);
            log.debug("Relayed chat message {} to {}", event.getId(), destination);
        } catch (Exception e) {
            log.error("Error processing chat event: {}", message, e);
        }
    }
}
