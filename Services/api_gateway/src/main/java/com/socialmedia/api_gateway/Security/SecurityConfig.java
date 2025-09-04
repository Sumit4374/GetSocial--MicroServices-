package com.socialmedia.api_gateway.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;


@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http){
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable) 
                .authorizeExchange(exchange -> exchange
                        .pathMatchers("/auth-service/api/auth/**").permitAll() 
                        .anyExchange().authenticated()        
                )
                .build();
    }
}
