package com.socialmedia.post_service.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "like-service")
public interface LikeServiceClient {

    @GetMapping("/api/like/{postId}")
    long getLikeCount(@PathVariable("postId") Long postId);

    @GetMapping("/api/like/{postId}/user/{userId}")
    boolean isPostLiked(@PathVariable("postId") Long postId, @PathVariable("userId") Long userId);
}
