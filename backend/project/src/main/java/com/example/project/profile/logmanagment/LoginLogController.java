package com.example.project.profile.logmanagment;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users/logs")
@RequiredArgsConstructor
public class LoginLogController {

    private final LoginLogService logService;

    // نمایش آخرین ۵ لاگ کاربر
    @GetMapping("/last5")
    @PreAuthorize("hasRole('USER') or hasRole('CEO')")
    public ResponseEntity<List<LoginLog>> last5Logs() {
        return ResponseEntity.ok(logService.getLast5LogsForCurrentUser());
    }
}

