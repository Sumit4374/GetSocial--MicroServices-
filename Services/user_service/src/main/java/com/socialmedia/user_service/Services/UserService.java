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
        return repo.findByUserId(userId).orElseThrow(()-> new RuntimeException("No user found"));
    }

    public List<UserProfile> getAllUser(){
        return repo.findAll();
    }

    public void updateProfilePic(Long userId, String picUrl){
        UserProfile userProfile = repo.findByUserId(userId).orElseThrow(
            () -> new RuntimeException("no user found")
        );

        if(picUrl!=null){
            userProfile.setProfilePicURL(picUrl);
            repo.save(userProfile);
        }else{
            throw new RuntimeException("Url Not found");
        }
    }

    public boolean isFollowing(Long userId, Long targetId){
        UserProfile userProfile = repo.findByUserId(userId).orElseThrow(
            ()-> new RuntimeException("No user Found")
        );
        UserProfile targetProfile = repo.findByUserId(targetId).orElseThrow(
            ()-> new RuntimeException("No Target user Found")
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
        UserProfile user = repo.findByUserId(userId).orElseThrow(
            ()-> new RuntimeException("No user found"));
        // Only overwrite fields that are actually provided to avoid clearing values unintentionally
        if (updateUser.getName() != null && !updateUser.getName().isBlank()) {
            user.setName(updateUser.getName());
        }
        if (updateUser.getBio() != null) {
            user.setBio(updateUser.getBio());
        }
        if (updateUser.getProfilePicURL() != null && !updateUser.getProfilePicURL().isBlank()) {
            user.setProfilePicURL(updateUser.getProfilePicURL());
        }
        return repo.save(user);
    }

    public void followUser(Long userId, Long targetId){
        UserProfile user = repo.findByUserId(userId).orElseThrow(
            ()-> new RuntimeException("No user Found"));
        UserProfile targetUser = repo.findByUserId(targetId).orElseThrow(
            ()-> new RuntimeException("No Target user Found"));
        
        // Update both sides of the bidirectional relationship
        user.getFollowing().add(targetUser);
        targetUser.getFollowers().add(user);
        
        // Save both entities
        repo.save(user);
        repo.save(targetUser);        
    }

    public void unFollowUser(Long userId, Long targetId){
        UserProfile user = repo.findByUserId(userId).orElseThrow(
            ()-> new RuntimeException("No user Found"));
        UserProfile targetUser = repo.findByUserId(targetId).orElseThrow(
            ()-> new RuntimeException("No Target user found"));
        
        // Update both sides of the bidirectional relationship
        user.getFollowing().remove(targetUser);
        targetUser.getFollowers().remove(user);
        
        // Save both entities
        repo.save(user);
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

    public List<UserProfileBasics> getFollowers(Long userId) {
        UserProfile user = repo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No user found"));
        return user.getFollowers().stream()
                .map(follower -> UserProfileBasics.builder()
                        .id(follower.getId())
                        .username(follower.getUsername())
                        .profilePicUrl(follower.getProfilePicURL())
                        .build())
                .toList();
    }

    public List<UserProfileBasics> getFollowing(Long userId) {
        UserProfile user = repo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No user found"));
        return user.getFollowing().stream()
                .map(following -> UserProfileBasics.builder()
                        .id(following.getId())
                        .username(following.getUsername())
                        .profilePicUrl(following.getProfilePicURL())
                        .build())
                .toList();
    }
}
