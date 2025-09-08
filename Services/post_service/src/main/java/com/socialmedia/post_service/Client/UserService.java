package com.socialmedia.post_service.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service", url = "${user.service.url}")
public interface UserService {
    @PutMapping("/api/users/{userId}/updateprofile")
    void updateprofile(@PathVariable Long userId, @RequestParam("url") String profilePicUrl);
}
