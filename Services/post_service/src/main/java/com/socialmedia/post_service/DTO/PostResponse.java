package com.socialmedia.post_service.DTO;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private Long userId;
    private String caption;
    private String mediaUrl;
    private String imageUrl;
    private LocalDateTime createdAt;
    private long likeCount;
    private long commentCount;

    @JsonProperty("isLiked")
    private boolean liked;

    private UserSummary user;
}
