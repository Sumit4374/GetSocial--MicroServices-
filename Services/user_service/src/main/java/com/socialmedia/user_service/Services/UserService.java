package com.socialmedia.user_service.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.socialmedia.user_service.DTO.CreateUserProfileRequest;
import com.socialmedia.user_service.DTO.UserProfileBasics;
import com.socialmedia.user_service.Model.UserProfile;
import com.socialmedia.user_service.Repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository repo;
    @Autowired
    private UserEventProducer producer;

    public UserService(UserRepository repo){
        this.repo=repo;
    }

    public UserProfile getByUserId(Long userId){
        return repo.findById(userId).orElseThrow(()-> new RuntimeException("No user found"));
    }

    public List<UserProfile> getAllUser(){
        return repo.findAll();
    }

    public void updateProfilePic(Long userId, String picUrl){
        UserProfile userProfile = repo.findByUserId(userId).orElseThrow(
            () -> new RuntimeException("no user found")
        );
        userProfile.setProfilePicURL(picUrl);
        repo.save(userProfile);
    }

    public boolean isFollowing(Long userId, Long targetId){
        UserProfile userProfile = repo.findById(userId).orElseThrow(
            ()-> new RuntimeException("No user Found")
        );
        UserProfile targetProfile = repo.findById(userId).orElseThrow(
            ()-> new RuntimeException("No user Found")
        );
        if(userProfile.getFollowing().contains(targetProfile)){
            return true;
        }
        return false;
    }

    public UserProfileBasics getBasics(Long userId){
        UserProfile user = repo.findByUserId(userId).orElseThrow(
            ()-> new RuntimeException("No user found")
        );
        UserProfileBasics basics = UserProfileBasics.builder()
                                                    .id(user.getId())
                                                    .username(user.getUsername())
                                                    .profilePicUrl(user.getProfilePicURL())
                                                    .build();
        return basics;
    }

    public UserProfile updateProfile(Long userId,UserProfile updateUser){
        UserProfile user = repo.findById(userId).orElseThrow(
            ()-> new RuntimeException("No user found"));
        user.setName(updateUser.getName());
        user.setBio(updateUser.getBio());
        user.setProfilePicURL(updateUser.getProfilePicURL());
        return repo.save(user);
    }

    public void followUser(Long userId, Long targetId){
        UserProfile user = repo.findById(userId).orElseThrow(
            ()-> new RuntimeException("No user Found"));
        UserProfile targetUser = repo.findById(targetId).orElseThrow(
            ()-> new RuntimeException("No Target user Found"));
        targetUser.getFollowers().add(user);
        repo.save(targetUser);        
    }

    public void unFollowUser(Long userId, Long targetId){
        UserProfile user = repo.findById(userId).orElseThrow(
            ()-> new RuntimeException("No user Found"));
        UserProfile targetUser = repo.findById(targetId).orElseThrow(
            ()-> new RuntimeException("No Target user found"));
        targetUser.getFollowers().remove(user);
        repo.save(targetUser);
    }

    public UserProfile create(CreateUserProfileRequest request) {
        UserProfile newUser = UserProfile.builder()
                    .userId(request.getUserId())
                    .username(request.getUsername())
                    .bio(request.getBio())
                    .build();
        newUser = repo.save(newUser);
        producer.createUserEvent(newUser);
        return newUser;
    }
}
