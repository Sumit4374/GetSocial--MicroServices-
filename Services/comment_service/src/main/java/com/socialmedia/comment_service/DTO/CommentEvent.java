package com.socialmedia.comment_service.DTO;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommentEvent {
    private String type;
    private Long commentId;
    private Long postId;
    private Long userId;
    private String comment;

    public CommentEvent() {}

    public CommentEvent(String type, Long commentId, Long postId, Long userId, String comment) {
        this.type = type;
        this.commentId = commentId;
        this.postId = postId;
        this.userId = userId;
        this.comment = comment;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getCommentId() {
        return commentId;
    }

    public void setCommentId(Long commentId) {
        this.commentId = commentId;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
