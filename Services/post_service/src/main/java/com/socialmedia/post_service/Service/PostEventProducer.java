package com.socialmedia.post_service.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.socialmedia.post_service.Model.Post;

@Service
public class PostEventProducer {
    @Autowired
    private KafkaTemplate<String,String> kafkaTemplate;

    public void sendPostCreatedEvent(Post post){
        String event = "{ \"postId\": "+post.getId()+
        ", \"userId\": "+post.getUserId()+
        ", \"caption\": \""+post.getCaption()+"\"}";
        kafkaTemplate.send("post-events",event);
    } 
}
