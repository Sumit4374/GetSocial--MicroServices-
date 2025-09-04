package com.socialmedia.auth_service.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.socialmedia.auth_service.DTO.JwtResponse;
import com.socialmedia.auth_service.DTO.LoginRequest;
import com.socialmedia.auth_service.DTO.SignUpRequest;
import com.socialmedia.auth_service.DTO.UserResponse;
import com.socialmedia.auth_service.Model.User;
import com.socialmedia.auth_service.Security.CustomUserDetails;
import com.socialmedia.auth_service.Services.AuthService;
import com.socialmedia.auth_service.Services.UserService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/auth/")
public class AuthController {

    @Autowired
    private AuthService authService;
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody SignUpRequest res){
        User user = authService.register(res);
        UserResponse resp= new UserResponse();
        resp.setUsername(user.getUsername());
        resp.setId(user.getId());
        resp.setBio(user.getBio());
        resp.setEmail(user.getEmail());
        resp.setProfilePicture(user.getProfilePicture());
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest res){
        JwtResponse jwtResponse = authService.login(res);
        return ResponseEntity.ok(jwtResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal CustomUserDetails userDetails){
        if(userDetails==null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userID=userDetails.getId();
        return ResponseEntity.ok(userService.getUserById(userID));
    }
    
}
