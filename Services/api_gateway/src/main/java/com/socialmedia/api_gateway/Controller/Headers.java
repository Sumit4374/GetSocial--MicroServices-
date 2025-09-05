package com.socialmedia.api_gateway.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.socialmedia.api_gateway.Components.Jwtutils;

import io.jsonwebtoken.Claims;

@RestController
public class Headers {

    @Autowired
    private Jwtutils jwtutils;
    
    @GetMapping("/headers")
    public ResponseEntity<Map<String,String>> getHeaders(
            @RequestHeader(value="X-User-Id", required = false) String userId,
            @RequestHeader(value="X-Username", required = false) String username,
            @RequestHeader(value="Authorization", required = false) String authorization) {

        if ((userId == null || username == null) && authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);
            if (jwtutils.validateToken(token)) {
                Claims claims = jwtutils.extractCliams(token);
                if (username == null) username = claims.getSubject();
                if (userId == null) userId = claims.get("id", String.class);
            }
        }

        Map<String,String> headers = new HashMap<>();
        headers.put("X-User-Id", userId==null?"":userId);
        headers.put("X-Username", username);
        return ResponseEntity.ok(headers);
    }
}
