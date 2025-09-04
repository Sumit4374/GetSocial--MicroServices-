package com.socialmedia.auth_service.Security;

import java.security.Key;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtUtil {
    
    private String secretKey;
    // Prefer application property 'jwt.secret', fallback to environment '.env' property 'JWT_SECRET'
    @Value("${jwt.secret:${JWT_SECRET:}}")
    private String configuredSecret;

    JwtUtil(){ }

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

    
    public String generateToken(String username){
        Map<String,Object> claims = new HashMap<>(); 
    long expiryMillis = 1000L * 60 * 60 * 24;
    return Jwts.builder()
                    .claims()
                    .add(claims)
                    .subject(username)
                    .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + expiryMillis))
                    .and()
                    .signWith(getKey())
                    .compact();
    }

    private Key getKey() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secretKey);
        } catch (IllegalArgumentException ex) {
            keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }


    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }


    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date(System.currentTimeMillis()));
    }

    private java.util.Date extractExpiration(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
    }
}
