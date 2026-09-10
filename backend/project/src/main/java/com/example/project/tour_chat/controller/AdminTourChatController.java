package com.example.project.tour_chat.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.tour_chat.dto.AdminTourChatMessageResponse;
import com.example.project.tour_chat.dto.ChatWarningRequest;
import com.example.project.tour_chat.dto.ChatWarningResponse;
import com.example.project.tour_chat.services.TourChatService;
import com.example.project.users.config.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * مانیتورینگ چت مسافر و مدیر آژانس — سمت سوپرادمین/ادمین (دلایل امنیتی)
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/tour-chat")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
public class AdminTourChatController {

    private final TourChatService tourChatService;
    private final SecurityUtils securityUtils;

    /** همه پیام‌های چت برای مانیتورینگ — جدول: متن پیام، فرستنده، گیرنده، تاریخ */
    @GetMapping("/messages")
    public ResponseEntity<ApiResponse<List<AdminTourChatMessageResponse>>> getMonitorMessages() {
        return ResponseEntity.ok(ApiResponse.ok("مانیتورینگ چت",
                tourChatService.getAdminMonitorMessages()));
    }

    /** صدور اخطار برای پیام نامرتبط */
    @PostMapping("/warn")
    public ResponseEntity<ApiResponse<ChatWarningResponse>> warn(
            @Valid @RequestBody ChatWarningRequest request) {
        String admin = securityUtils.currentUsername();
        ChatWarningResponse data = tourChatService.warnMessage(admin, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("اخطار برای فرستنده پیام صادر شد", data));
    }
}
