package com.socialmedia.api_gateway.Components;


import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import io.jsonwebtoken.Claims;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter  extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config>{
    
    @Autowired
    private Jwtutils jwtutils;

    public JwtAuthenticationFilter(Jwtutils jwtutils){
        super(Config.class);
        this.jwtutils = jwtutils;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain)->{
            if(exchange.getRequest().getURI().getPath().contains("/api/auth")){
                return chain.filter(exchange);
            }
            String authHeaders = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if(authHeaders==null || !authHeaders.startsWith("Bearer ")){
                return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
            }
            String token = authHeaders.substring(7);
            if(!jwtutils.validateToken(token)){
                return onError(exchange, "Invalid Jwt Token", HttpStatus.UNAUTHORIZED);
            }
            Claims claim = jwtutils.extractCliams(token);
            String username = claim.getSubject();
            String userId = claim.get("id",String.class);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(username,null, Collections.emptyList());
            ServerWebExchange mutatedExchange = exchange.mutate()
                                                        .request(r -> r.headers(headers->{
                                                            headers.add("X-User-Id", userId);
                                                            headers.add("X-Username", username);
                                                        }))
                                                        .build();
            return chain.filter(mutatedExchange)
                        .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication));
        };
    }

    public Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus status){
        exchange.getResponse().setStatusCode(status);
        return exchange.getResponse().setComplete();
    }

    public static class Config{}
}
