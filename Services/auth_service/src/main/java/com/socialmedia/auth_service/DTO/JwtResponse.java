package com.socialmedia.auth_service.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String tokenType="Bearer";
    private Long userId;
    private String username;
}
