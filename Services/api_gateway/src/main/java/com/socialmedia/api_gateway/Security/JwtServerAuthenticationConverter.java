package com.socialmedia.api_gateway.Security;


import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

public class JwtServerAuthenticationConverter implements ServerAuthenticationConverter {
    
    @Override
    public Mono<Authentication> convert(ServerWebExchange exchange) {
        String auth = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            return Mono.just(new UsernamePasswordAuthenticationToken(null, token));
        }

        // Fallback for WebSocket/SockJS handshake where headers can't carry Authorization
        String token = exchange.getRequest().getQueryParams().getFirst("access_token");
        if (token == null || token.isBlank()) {
            token = exchange.getRequest().getQueryParams().getFirst("token");
        }
        if (token != null && !token.isBlank()) {
            return Mono.just(new UsernamePasswordAuthenticationToken(null, token));
        }

        return Mono.empty();
    }
}
