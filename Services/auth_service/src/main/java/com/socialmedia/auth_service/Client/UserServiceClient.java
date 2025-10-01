package com.socialmedia.auth_service.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.socialmedia.auth_service.DTO.CreateUserProfileRequest;

@FeignClient(name="user-service", url="${user.service.url}")
public interface UserServiceClient {

    @PostMapping("/api/users/create")
    CreateUserProfileRequest createUser(@RequestBody CreateUserProfileRequest request);
}
