package com.socialmedia.user_service.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.socialmedia.user_service.Model.UserProfile;

@Service
public class UserEventProducer {
    
    @Autowired
    private KafkaTemplate<String,String> template;

    public void createUserEvent(UserProfile user){
        String event = "{\"UserId\": \""+user.getId()+
                        "\",\"Email\": \""+user.getUsername()+"\"}";
        template.send("user-events",event);
    }
}
