package com.socialmedia.api_gateway.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;

import com.socialmedia.api_gateway.Components.Jwtutils;


@Configuration
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http, Jwtutils jwtutils){

        AuthenticationWebFilter jwtAuthWebFilter = new AuthenticationWebFilter(new JwtReactiveAuthenticationManager(jwtutils));
        jwtAuthWebFilter.setServerAuthenticationConverter(new JwtServerAuthenticationConverter());
        jwtAuthWebFilter.setSecurityContextRepository(NoOpServerSecurityContextRepository.getInstance());

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable) 
        .authorizeExchange(exchange -> exchange
            .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .pathMatchers("/auth-service/api/auth/login").permitAll() 
                        .pathMatchers("/auth-service/api/auth/register").permitAll() 
                        .anyExchange().authenticated()        
                )
                .addFilterAt(jwtAuthWebFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .build();
    }
}
