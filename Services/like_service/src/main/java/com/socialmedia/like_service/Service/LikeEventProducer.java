package com.socialmedia.like_service.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;


@Service
public class LikeEventProducer {
    
    @Autowired
    private KafkaTemplate<String,String> template;

    public void likeEvent(Long postId,Long userId){
        String event = "{\"type\": \"Post-Liked\", \"postId\": "+postId+
                            ", \"userId\": "+userId+" }";
        template.send("like-event",event);
    }
    public void unLikeEvent(Long postId,Long userId){
        String event = "{\"type\": \"Post-UnLiked\", \"postId\": "+postId+
                            ", \"userId\": "+userId+" }";
        template.send("like-event",event);
    }

    @KafkaListener(topics = "like-event", groupId = "like-service-group")
    public void consumer(String message){
        System.out.println(message);
    }
}
