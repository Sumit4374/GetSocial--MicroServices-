package com.socialmedia.chat_service.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping("/{userId}/is-following/{otherUserId}")
    boolean isFollowing(@PathVariable("userId") Long userId,@PathVariable("otherUserId") Long otherUserId);
    
    @GetMapping("{userId}/basics")
    UserBasicDto getBasic(@PathVariable("userId") Long userId);
} 