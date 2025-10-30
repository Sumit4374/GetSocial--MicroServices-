package com.socialmedia.notification_service.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.socialmedia.notification_service.DTO.PostDTO;

@FeignClient(name = "post-service")
public interface PostServiceClient {
    
    @GetMapping("/api/post/post/{postId}")
    PostDTO getPostById(@PathVariable("postId") Long postId);
}
