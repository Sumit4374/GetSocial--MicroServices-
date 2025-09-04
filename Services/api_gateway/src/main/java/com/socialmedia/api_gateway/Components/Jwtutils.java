package com.socialmedia.api_gateway.Components;

import java.util.Base64;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class Jwtutils {
    
    private String secretKey;
    @Value("${jwt.secret:}")
    private String configuredSecret;

    @PostConstruct
    void initSecret() {
        if (configuredSecret != null && !configuredSecret.isBlank()) {
            this.secretKey = configuredSecret.trim();
        } else {
            try {
                KeyGenerator keyGen = KeyGenerator.getInstance("HmacSHA256");
                SecretKey keys = keyGen.generateKey();
                this.secretKey = Base64.getEncoder().encodeToString(keys.getEncoded());
                System.out.println("[JWT] No jwt.secret configured; generated a temporary development secret.");
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }
    public Claims extractCliams(String token){
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretKey)))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    public boolean validateToken(String token){
        try {
            extractCliams(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
