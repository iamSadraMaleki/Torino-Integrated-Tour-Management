package com.example.project.users.config;

import com.example.project.users.Repasitory.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        logger.debug("Authorization header: {}", header);

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            logger.debug("Extracted token: {}", token.substring(0, Math.min(token.length(), 10)) + "...");

            if (jwtService.isValid(token)) {
                logger.debug("Token is valid");
                String username = jwtService.extractUsername(token);
                logger.debug("Extracted username from token: '{}'", username);

                var userOpt = userRepository.findByUsername(username);
                if (userOpt.isPresent()) {
                    var user = userOpt.get();
                    logger.debug("User found: {}", user.getUsername());

                    var authorities = user.getRoles().stream()
                            .map(r -> new SimpleGrantedAuthority(r.getName()))
                            .collect(Collectors.toList());

                    var userDetails = User.builder()
                            .username(user.getUsername())
                            .password(user.getPassword())
                            .authorities(authorities)
                            .disabled(!user.isEnabled())
                            .build();

                    var auth = new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    logger.debug("Authentication set for user: {}, authorities: {}", username, authorities);
                } else {
                    logger.warn("User not found in DB for username: '{}'", username);
                }
            } else {
                logger.warn("Invalid token");
            }
        } else {
            logger.debug("No Bearer token found");
        }
        filterChain.doFilter(request, response);
    }
}