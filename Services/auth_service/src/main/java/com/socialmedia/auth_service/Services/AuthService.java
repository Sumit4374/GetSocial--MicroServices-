package com.socialmedia.auth_service.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.socialmedia.auth_service.Client.UserServiceClient;
import com.socialmedia.auth_service.DTO.CreateUserProfileRequest;
import com.socialmedia.auth_service.DTO.JwtResponse;
import com.socialmedia.auth_service.DTO.LoginRequest;
import com.socialmedia.auth_service.DTO.SignUpRequest;
import com.socialmedia.auth_service.Model.User;
import com.socialmedia.auth_service.Repository.UserRepository;
import com.socialmedia.auth_service.Security.JwtUtil;

@Service
public class AuthService {
    
    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private UserServiceClient serviceClient;

    public User register(SignUpRequest req){
        if(userRepo.existsByUsername(req.getUsername())){
            throw new RuntimeException("UserName Already taken");
        }
        if(userRepo.existsByEmail(req.getEmail())){
            throw new RuntimeException("Email Already Taken");
        }
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(bCryptPasswordEncoder.encode(req.getPassword()));
        user.setEmail(req.getEmail());
        user.setBio(req.getBio());
        try {
            CreateUserProfileRequest profileRequest = CreateUserProfileRequest.builder()
                        .userId(user.getId())
                        .username(user.getUsername())
                        .bio(user.getBio())
                        .build();
            serviceClient.createUser(profileRequest);
        } catch (Exception e) {
            System.out.println("Failed to create profile in userService "+ e);
        }
        return userRepo.save(user);
    }

    public JwtResponse login(LoginRequest req){
        User user = userRepo.findByUsername(req.getUsernameOrEmail())
                .orElseGet(() -> userRepo.findByEmail(req.getUsernameOrEmail()).orElse(null));
        if (user == null) {
            throw new RuntimeException("Invalid Credentials");
        }

        if (!bCryptPasswordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid Credentials");
        }

        String token = jwtUtil.generateToken(user.getUsername(),user.getId().toString());
        return new JwtResponse(token, "Bearer", user.getId(), user.getUsername());
    }
    
}
