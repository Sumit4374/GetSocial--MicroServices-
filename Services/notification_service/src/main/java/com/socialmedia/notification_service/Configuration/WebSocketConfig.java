package com.socialmedia.notification_service.Configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer{
    @Override
    // @SuppressWarnings("null")
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    // @SuppressWarnings("null")
    public void registerStompEndpoints(StompEndpointRegistry registry) {
    // Native WebSocket endpoint for STOMP
    registry.addEndpoint("/ws")
        .setAllowedOriginPatterns("*");

    // SockJS fallback endpoint (optional)
    registry.addEndpoint("/ws-sock")
        .setAllowedOriginPatterns("*")
        .withSockJS();
    }
}
