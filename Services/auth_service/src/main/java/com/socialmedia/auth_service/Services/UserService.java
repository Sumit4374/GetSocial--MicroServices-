package com.socialmedia.auth_service.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.socialmedia.auth_service.DTO.UserResponse;
import com.socialmedia.auth_service.Model.User;
import com.socialmedia.auth_service.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepo;

    public UserResponse getUserById(Long id){
        User user = userRepo.findById(id).orElseThrow(()-> new RuntimeException("No user Found!"));
        UserResponse response = new UserResponse();
        response.setUsername(user.getUsername());
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setBio(user.getBio());
        response.setProfilePicture(user.getProfilePicture());
        return response;
    }
}
