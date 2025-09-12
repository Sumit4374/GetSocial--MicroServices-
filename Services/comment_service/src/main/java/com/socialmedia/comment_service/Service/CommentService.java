package com.socialmedia.comment_service.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.socialmedia.comment_service.Model.Comments;
import com.socialmedia.comment_service.Repository.CommentRepository;

@Service
public class CommentService {
    
    @Autowired
    private CommentRepository repo;
    @Autowired
    private CommentEventProducer producer;

    public Comments addComment(Long postId,Long userId,String comment){
        Comments newComment = new Comments();
        newComment.setPostId(postId);
        newComment.setUserId(userId);
        newComment.setComment(comment);
        newComment = repo.save(newComment);
        producer.addComment(newComment);
        return newComment;
    }

    public void deleteComment(Long commentId){
        Comments comment = repo.findById(commentId).orElseThrow(()-> new RuntimeException("No Comment found"));
        producer.deleteComment(comment);
        repo.delete(comment);
    }

    public List<Comments> getCommentsOnpost(Long postId){
        return repo.findByPostId(postId);
    }
}

