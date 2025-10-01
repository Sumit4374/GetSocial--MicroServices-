package com.socialmedia.comment_service.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.socialmedia.comment_service.Model.Comments;
import com.socialmedia.comment_service.Service.CommentService;

@RestController
@RequestMapping("/api/comment")
public class CommentController {
    
    @Autowired
    private CommentService service;

    @PostMapping("/{postId}/user/{userId}")
    public ResponseEntity<Comments> addComments(
        @PathVariable Long postId,
        @PathVariable Long userId,
        @RequestBody String comment
    ){
        return ResponseEntity.ok(service.addComment(postId, userId, comment));
    }

    @DeleteMapping("/{commentId}/delete")
    public ResponseEntity<String> deleteComment(@PathVariable Long commentId){
        service.deleteComment(commentId);
        return ResponseEntity.ok("Comment deleted successfully");
    }

    @GetMapping("/{postId}")
    public ResponseEntity<List<Comments>> getCommentsForPost(@PathVariable Long postId){
        return ResponseEntity.ok(service.getCommentsOnpost(postId));
    }

    @GetMapping("/{postId}/count")
    public ResponseEntity<Long> getCommentCount(@PathVariable Long postId) {
        return ResponseEntity.ok(service.getCommentCount(postId));
    }
}
