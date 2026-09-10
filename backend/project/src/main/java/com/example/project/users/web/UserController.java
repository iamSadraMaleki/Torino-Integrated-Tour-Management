package com.example.project.users.web;

import com.example.project.profile.changepassword.ChangePasswordRequest;
import com.example.project.users.dto.UpdateProfileRequest;
import com.example.project.users.dto.UserDto;
import com.example.project.users.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        try {
            String principal = SecurityContextHolder.getContext().getAuthentication().getName();
            if (principal == null) {
                logger.warn("No authenticated user found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            logger.info("Extracted username from authentication: '{}'", principal);
            UserDto userDto = userService.getCurrentUser(principal);
            logger.info("User found: {}", userDto.getUsername());
            return ResponseEntity.ok(userDto);
        } catch (ResponseStatusException e) {
            logger.error("Error retrieving current user: {}", e.getMessage());
            return ResponseEntity.status(e.getStatusCode()).body(null);
        }
    }

    @GetMapping("/ceo-only")
    @PreAuthorize("hasAuthority('ROLE_CEO')")
    public ResponseEntity<String> adminOnly() {
        return ResponseEntity.ok("Hello Admin");
    }

    @GetMapping("/SUPERADMIN-only")
    @PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")
    public ResponseEntity<String> businessOnly() {
        return ResponseEntity.ok("Hello Business");
    }

    @PutMapping("/change-password")
    public ResponseEntity<UserDto> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            UserDto userDto = userService.changePassword(request);
            return ResponseEntity.ok(userDto);
        } catch (ResponseStatusException e) {
            logger.error("Error changing password: {}", e.getMessage());
            return ResponseEntity.status(e.getStatusCode()).body(null);
        }
    }

    @PutMapping("/update-profile")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            String principal = SecurityContextHolder.getContext().getAuthentication().getName();
            UserDto updatedUser = userService.updateProfile(principal, request);
            return ResponseEntity.ok(updatedUser);
        } catch (ResponseStatusException e) {
            logger.error("Error updating profile: {}", e.getMessage());
            return ResponseEntity.status(e.getStatusCode()).body(null);
        }
    }

    // ========== SUPERADMIN ONLY APIs ==========
    @GetMapping
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        logger.info("SUPERADMIN requesting all users list");
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/role/{roleName}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<List<UserDto>> getUsersByRole(@PathVariable String roleName) {
        logger.info("Admin requesting users with role: {}", roleName);
        List<UserDto> users = userService.getUsersByRole(roleName);
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/{userId}/toggle-enabled")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<UserDto> toggleUserEnabled(@PathVariable Long userId) {
        logger.info("Admin toggling enabled status for user ID: {}", userId);
        UserDto updatedUser = userService.toggleUserEnabled(userId);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        logger.info("SUPERADMIN requesting user with ID: {}", id);
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        logger.info("SUPERADMIN deleting user with ID: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}