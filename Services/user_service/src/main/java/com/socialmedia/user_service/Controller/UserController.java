package com.socialmedia.user_service.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.socialmedia.user_service.DTO.CreateUserProfileRequest;
import com.socialmedia.user_service.DTO.UserProfileBasics;
import com.socialmedia.user_service.Model.UserProfile;
import com.socialmedia.user_service.Services.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserProfile>> getAllUser(){
        return ResponseEntity.ok(userService.getAllUser());
    }

    @PostMapping("/create")
    public ResponseEntity<CreateUserProfileRequest> create(@RequestBody CreateUserProfileRequest request){
        UserProfile newUser = userService.create(request);
        CreateUserProfileRequest profile = CreateUserProfileRequest.builder()
                                            .userId(newUser.getUserId())
                                            .bio(request.getBio())
                                            .username(newUser.getUsername())
                                            .build();
        return ResponseEntity.ok(profile);
    }

    @PutMapping("{userId}/updateprofile")
    public ResponseEntity<String> updateProfilePic(@PathVariable Long userId, @RequestParam String profilePicUrl){
        userService.updateProfilePic(userId, profilePicUrl);
        return ResponseEntity.ok("Profile picture updated successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfile> getProfile(@PathVariable Long id){
        return ResponseEntity.ok().body(userService.getByUserId(id));
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<UserProfile> updateProfile(@PathVariable Long id ,@RequestBody UserProfile updatedProfile){
        return ResponseEntity.ok(userService.updateProfile(id,updatedProfile));
    }
    

    @PostMapping("/{id}/follow")
    public ResponseEntity<String> followUser(@RequestHeader("X-User-Id") Long userId, @PathVariable Long id){
        userService.followUser(userId, id);
        return ResponseEntity.ok("Follow Successfull");
    }

    @PostMapping("/{id}/unfollow")
    public ResponseEntity<String> unFollowUser(@RequestHeader("X-User-Id") Long userId, @PathVariable Long id){
        userService.unFollowUser(userId, id);
        return ResponseEntity.ok("Unfollow Successfull");
    }

    @GetMapping("/{userId}/is-following/{otherUserId}")
    public boolean isFollowing(@PathVariable Long userId, @PathVariable Long otherUserId){
        return userService.isFollowing(userId, otherUserId);
    }

    @GetMapping("{userId}/basics")
    public ResponseEntity<UserProfileBasics> getBasics(@PathVariable Long userId){
        return ResponseEntity.ok(userService.getBasics(userId));
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<List<UserProfileBasics>> getFollowers(@PathVariable Long id){
        return ResponseEntity.ok(userService.getFollowers(id));
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<List<UserProfileBasics>> getFollowing(@PathVariable Long id){
        return ResponseEntity.ok(userService.getFollowing(id));
    }
}