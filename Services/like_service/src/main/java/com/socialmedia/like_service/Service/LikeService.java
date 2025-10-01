package com.socialmedia.like_service.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.socialmedia.like_service.Model.Likes;
import com.socialmedia.like_service.Repository.LikesRepository;

@Service
public class LikeService {
    
    @Autowired
    private LikesRepository repo;
    @Autowired
    private LikeEventProducer producer;

    public String likePost(Long postId,Long userId){
        if(repo.existsByPostIdAndUserId(postId, userId)){
            return "Already Liked";
        }
        Likes like = new Likes();
        like.setPostId(postId);
        like.setUserId(userId);
        try {
            producer.likeEvent(postId, userId);
        } catch (RuntimeException ex) {
            // Degrade gracefully if the event broker is unavailable
            // so the like operation still succeeds locally.
            System.err.printf("Failed to publish like event for post %d user %d: %s%n",
                    postId, userId, ex.getMessage());
        }
        repo.save(like);
        return "Liked the post";
    }

    @Transactional
    public String unLikePost(Long postId, Long userId){
        if(!repo.existsByPostIdAndUserId(postId, userId)){
            return "Post is not liked yet";
        }
        try {
            producer.unLikeEvent(postId, userId);
        } catch (RuntimeException ex) {
            System.err.printf("Failed to publish unlike event for post %d user %d: %s%n",
                    postId, userId, ex.getMessage());
        }
        repo.deleteByPostIdAndUserId(postId, userId);
        return "Post Unliked"; 
    }

    public long getLikeCount(Long postId) {
        return repo.countByPostId(postId);
    }

    public boolean isPostLiked(Long postId, Long userId) {
        return repo.existsByPostIdAndUserId(postId, userId);
    }
}
