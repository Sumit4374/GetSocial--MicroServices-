package com.socialmedia.post_service.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "comment-service")
public interface CommentServiceClient {

    @GetMapping("/api/comment/{postId}/count")
    long getCommentCount(@PathVariable("postId") Long postId);
}
