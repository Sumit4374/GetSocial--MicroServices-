package com.socialmedia.comment_service.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.socialmedia.comment_service.DTO.CommentEvent;
import com.socialmedia.comment_service.Model.Comments;

@Service
public class CommentEventProducer {
    
    @Autowired
    private KafkaTemplate<String,String> template;

    @Autowired
    private ObjectMapper objectMapper;

    public void addComment(Comments comment){
        CommentEvent event = new CommentEvent(
            "Comment added",
            comment.getId(),
            comment.getPostId(),
            comment.getUserId(),
            comment.getComment()
        );
        sendEvent(event);
    }
    public void deleteComment(Comments comment){
        CommentEvent event = new CommentEvent(
            "Comment deleted",
            comment.getId(),
            comment.getPostId(),
            comment.getUserId(),
            comment.getComment()
        );
        sendEvent(event);
    }

    private void sendEvent(CommentEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            template.send("comment-events", payload);
        } catch (Exception e) {
            throw new RuntimeException("Failed to publish comment event", e);
        }
    }
}
