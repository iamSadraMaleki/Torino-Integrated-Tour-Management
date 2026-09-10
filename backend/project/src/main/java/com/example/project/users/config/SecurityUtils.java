package com.example.project.users.config;

import com.example.project.users.Repasitory.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        Object principal = auth.getPrincipal();

        // JwtAuthenticationFilter شما، principal را UserDetails می‌گذارد :contentReference[oaicite:2]{index=2}
        if (principal instanceof UserDetails userDetails) {
            String username = userDetails.getUsername();
            if (username == null || username.isBlank()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid principal username");
            }
            return username;
        }

        // گاهی principal می‌تواند String باشد
        if (principal instanceof String s) {
            if ("anonymousUser".equalsIgnoreCase(s)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
            }
            return s;
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unsupported authentication principal");
    }

    public Long currentUserId() {
        String username = currentUsername();

        // چون JwtService توکن را با subject=username می‌سازد :contentReference[oaicite:3]{index=3}
        return userRepository.findByUsername(username)
                .map(u -> u.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
