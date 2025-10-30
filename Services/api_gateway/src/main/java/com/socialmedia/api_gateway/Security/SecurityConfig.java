package com.socialmedia.api_gateway.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;

import com.socialmedia.api_gateway.Components.Jwtutils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http, Jwtutils jwtutils){

        AuthenticationWebFilter jwtAuthWebFilter = new AuthenticationWebFilter(new JwtReactiveAuthenticationManager(jwtutils));
        jwtAuthWebFilter.setServerAuthenticationConverter(new JwtServerAuthenticationConverter());
        jwtAuthWebFilter.setSecurityContextRepository(NoOpServerSecurityContextRepository.getInstance());

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .exceptionHandling(ex -> ex
                    .authenticationEntryPoint((exchange, cause) -> {
                        if (cause != null) {
                            log.debug("Authentication failed: {}", cause.getMessage());
                        }
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        return exchange.getResponse().setComplete();
                    })
                    .accessDeniedHandler((exchange, cause) -> {
                        if (cause != null) {
                            log.debug("Access denied: {}", cause.getMessage());
                        }
                        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                        return exchange.getResponse().setComplete();
                    })
                )
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
