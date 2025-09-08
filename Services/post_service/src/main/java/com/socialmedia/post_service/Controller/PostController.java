package com.socialmedia.post_service.Controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.socialmedia.post_service.Client.UserService;
import com.socialmedia.post_service.Model.Post;
import com.socialmedia.post_service.Service.PostService;

@RestController
@RequestMapping("/api/post")
public class PostController {
    
    @Autowired
    private PostService postService;
    @Autowired UserService userClient;

    @GetMapping("/head")
    public ResponseEntity<String> getHeader(@RequestHeader(value = "X-User-Id", required = false) String userId){
        return ResponseEntity.ok(userId);
    }

    @GetMapping("/feed")
    public ResponseEntity<List<Post>> getSuggestedFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getSuggestedPosts(page, size));
    }

    @PostMapping("/create")
    public ResponseEntity<Post> createPost(
        @RequestHeader(value = "X-User-Id") Long userId,
        @RequestParam("caption") String caption,
        @RequestParam("file") MultipartFile file
    )throws IOException{
        return ResponseEntity.ok(postService.createPost(userId, caption, file));
    }

    @PostMapping("/profile-pic")
    public ResponseEntity<String> uploadProfilePic(
        @RequestHeader("X-User-Id") Long userId,
        @RequestParam("file") MultipartFile file
    )throws IOException {
        userClient.updateprofile(userId, postService.createProfilePic(file));
        return ResponseEntity.ok("Profile Pic Updated");
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Post>> getPostsbyUser(@PathVariable Long userId){
        return ResponseEntity.ok(postService.getPostsByUser(userId));
    }

    @DeleteMapping("/delete/{postId}")
    public ResponseEntity<String> deletePost(
        @RequestHeader("X-User-Id") Long userId,
        @PathVariable Long postId){
        postService.deletePost(userId, postId);
        return ResponseEntity.ok("Post Deleted");
    }
}
