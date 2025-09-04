package com.socialmedia.api_gateway.Security;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.socialmedia.api_gateway.Components.Jwtutils;

import io.jsonwebtoken.Claims;
import reactor.core.publisher.Mono;

@Component
public class JwtReactiveAuthenticationManager implements ReactiveAuthenticationManager{
    
    @Autowired
    private Jwtutils jwtutils;

    public JwtReactiveAuthenticationManager(Jwtutils jwtutils){
        this.jwtutils=jwtutils;
    }

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        String token = authentication.getCredentials()!=null? authentication.getCredentials().toString() : null;
        if(token==null || !jwtutils.validateToken(token)){
            return Mono.empty();
        }
        Claims claims = jwtutils.extractCliams(token);
        String username = claims.getSubject();
        String userId = claims.get("id",String.class);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(username,null, Collections.emptyList());
        auth.setDetails(userId);
        return Mono.just(auth);
    }

}
