package com.socialmedia.like_service.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.socialmedia.like_service.Service.LikeService;

@RestController
@RequestMapping("/api/like")
public class LikeController {
    
    @Autowired
    private LikeService service;

    @PostMapping("/{postId}/user/{userId}")
    public ResponseEntity<String> likePost(@PathVariable Long postId,@PathVariable Long userId){
        return ResponseEntity.ok(service.likePost(postId, userId));
    }
    @DeleteMapping("{postId}/user/{userId}/delete")
    public ResponseEntity<String> unLikePost(@PathVariable Long postId,@PathVariable Long userId){
        return ResponseEntity.ok(service.unLikePost(postId, userId));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long postId) {
        return ResponseEntity.ok(service.getLikeCount(postId));
    }

    @GetMapping("/{postId}/user/{userId}")
    public ResponseEntity<Boolean> isPostLiked(@PathVariable Long postId, @PathVariable Long userId) {
        return ResponseEntity.ok(service.isPostLiked(postId, userId));
    }
}
