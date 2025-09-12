package com.socialmedia.comment_service.Service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class CommentEventConsumer {
 
    @KafkaListener(topics = "comment-events",groupId = "comment-service-media")
    public void consume(String message){
        System.out.println(message);
    }
}
