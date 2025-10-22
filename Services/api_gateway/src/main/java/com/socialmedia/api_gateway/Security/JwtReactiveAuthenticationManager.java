package com.socialmedia.api_gateway.Security;

import java.util.Collections;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import com.socialmedia.api_gateway.Components.Jwtutils;

import io.jsonwebtoken.Claims;
import reactor.core.publisher.Mono;

public class JwtReactiveAuthenticationManager implements ReactiveAuthenticationManager{
    
    private final Jwtutils jwtutils;

    public JwtReactiveAuthenticationManager(Jwtutils jwtutils){
        this.jwtutils = jwtutils;
    }

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        String token = authentication.getCredentials() != null ? authentication.getCredentials().toString() : null;
        
        if (token == null) {
            return Mono.error(new BadCredentialsException("Invalid token"));
        }
        
        if (!jwtutils.validateToken(token)) {
            return Mono.error(new BadCredentialsException("Invalid or expired token"));
        }
        
        try {
            Claims claims = jwtutils.extractCliams(token);
            String username = claims.getSubject();
            String userId = claims.get("id", String.class);

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                username, 
                null, 
                Collections.emptyList()
            );
            auth.setDetails(userId);
            return Mono.just(auth);
        } catch (Exception e) {
            return Mono.error(new BadCredentialsException("Token processing failed: " + e.getMessage()));
        }
    }
}
