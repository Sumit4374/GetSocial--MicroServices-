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
        producer.likeEvent(postId, userId);
        repo.save(like);
        return "Liked the post";
    }

    @Transactional
    public String unLikePost(Long postId, Long userId){
        if(!repo.existsByPostIdAndUserId(postId, userId)){
            return "Post is not liked yet";
        }
        producer.unLikeEvent(postId, userId);
        repo.deleteByPostIdAndUserId(postId, userId);
        return "Post Unliked"; 
    }
}
