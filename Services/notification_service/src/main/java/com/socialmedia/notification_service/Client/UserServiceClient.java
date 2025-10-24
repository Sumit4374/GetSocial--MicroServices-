package com.socialmedia.notification_service.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.socialmedia.notification_service.DTO.UserDTO;

@FeignClient(name = "user-service")
public interface UserServiceClient {
    
    @GetMapping("/api/users/{userId}")
    UserDTO getUserById(@PathVariable("userId") Long userId);
}
