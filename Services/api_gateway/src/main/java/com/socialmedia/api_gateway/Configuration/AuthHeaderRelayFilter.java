package com.socialmedia.api_gateway.Configuration;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class AuthHeaderRelayFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // If Authorization header already present, do nothing
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && !authHeader.isBlank()) {
            return chain.filter(exchange);
        }

        // Copy access_token/token query param into Authorization header for downstream (helps WS handshake)
        String qToken = request.getQueryParams().getFirst("access_token");
        if (qToken == null || qToken.isBlank()) {
            qToken = request.getQueryParams().getFirst("token");
        }

        if (qToken != null && !qToken.isBlank()) {
            final String bearer = "Bearer " + qToken;
            ServerHttpRequest mutated = request.mutate()
                    .headers(h -> h.add(HttpHeaders.AUTHORIZATION, bearer))
                    .build();
            return chain.filter(exchange.mutate().request(mutated).build());
        }

        return chain.filter(exchange);
    }

    // Run before Netty routing filters but after security auth converter; priority low number = high precedence
    @Override
    public int getOrder() {
        return -1;
    }
}
