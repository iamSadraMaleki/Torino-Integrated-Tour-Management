package com.example.project.users.web;


import com.example.project.users.dto.RegisterRequest;
import com.example.project.users.dto.UserDto;
import com.example.project.users.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final UserService userService;

    @PostMapping("/register-superadmin")
    public ResponseEntity<UserDto> registerSuperAdmin(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.registerSuperAdmin(request));
    }
}
