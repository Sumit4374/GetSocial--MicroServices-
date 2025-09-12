package com.socialmedia.comment_service.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.socialmedia.comment_service.Model.Comments;

@Service
public class CommentEventProducer {
    
    @Autowired
    private KafkaTemplate<String,String> template;

    public void addComment(Comments comment){
        String event = "{ \"type\": \"comment added\", "+
        "\"commentId\": "+comment.getId()+
        ", \"postId\": "+comment.getPostId()+
        ", \"userId\": "+comment.getUserId()+
        ", \"comment\": "+comment.getComment()+" }";
        template.send("comment-events",event);
    }
    public void deleteComment(Comments comment){
        String event = "{ \"type\": \"comment deleted\", "+
        "\"commentId\": "+comment.getId()+
        ", \"postId\": "+comment.getPostId()+
        ", \"userId\": "+comment.getUserId()+
        ", \"comment\": "+comment.getComment()+" }";
        template.send("comment-events",event);
    }
}
