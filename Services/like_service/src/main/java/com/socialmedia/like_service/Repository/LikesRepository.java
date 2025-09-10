package com.socialmedia.like_service.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.socialmedia.like_service.Model.Likes;

@Repository
public interface LikesRepository extends JpaRepository<Likes,Long> {
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    @Transactional
    @Modifying(clearAutomatically=true, flushAutomatically =  true)
    void deleteByPostIdAndUserId(Long postId, Long userId);
    long countByPostId(Long postId);
}
