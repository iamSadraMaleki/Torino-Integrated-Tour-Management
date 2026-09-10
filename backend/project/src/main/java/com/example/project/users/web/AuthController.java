package com.example.project.users.web;

import com.example.project.profile.logmanagment.LoginLogService;
import com.example.project.users.Repasitory.UserRepository;
import com.example.project.users.config.JwtService;
import com.example.project.users.dto.*;
import com.example.project.users.model.User;
import com.example.project.users.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final LoginLogService loginLogService;
    private final JwtService jwtService;


    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.registerPublic(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest) {
        AuthResponse response = userService.login(request);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String ip = httpRequest.getRemoteAddr();

        loginLogService.logAction(user, "LOGIN", ip);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token missing or invalid");
        }

        String token = header.substring(7);
        if (!jwtService.isValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalid or expired");
        }

        String username = jwtService.extractUsername(token);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String ip = request.getRemoteAddr();

        loginLogService.logAction(user, "LOGOUT", ip);

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok("Logged out successfully");
    }
}
