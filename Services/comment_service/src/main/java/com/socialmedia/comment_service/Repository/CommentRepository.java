package com.socialmedia.comment_service.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.socialmedia.comment_service.Model.Comments;

@Repository
public interface CommentRepository extends JpaRepository<Comments,Long>{
    // @Query("select c from comments c where c.postId = :postId")
    List<Comments> findByPostId(Long postId);
}
