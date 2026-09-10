package com.example.project.inbox.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.inbox.dto.InboxMessageResponse;
import com.example.project.inbox.dto.InboxStatsResponse;
import com.example.project.inbox.services.InboxService;
import com.example.project.users.config.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * صندوق دریافت پیام (اینباکس) — سمت مسافر
 */
@Slf4j
@RestController
@RequestMapping("/api/user/inbox")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_USER')")
public class UserInboxController {

    private final InboxService inboxService;
    private final SecurityUtils securityUtils;

    /** لیست پیام‌های اینباکس */
    @GetMapping
    public ResponseEntity<ApiResponse<List<InboxMessageResponse>>> getInbox() {
        String username = securityUtils.currentUsername();
        return ResponseEntity.ok(ApiResponse.ok("لیست پیام‌ها",
                inboxService.getMyInbox(username)));
    }

    /** آمار اینباکس (کل + نخوانده) */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<InboxStatsResponse>> getStats() {
        String username = securityUtils.currentUsername();
        return ResponseEntity.ok(ApiResponse.ok("آمار اینباکس",
                inboxService.getStats(username)));
    }

    /** علامت‌گذاری یک پیام به‌عنوان خوانده‌شده */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<InboxMessageResponse>> markRead(@PathVariable Long id) {
        String username = securityUtils.currentUsername();
        return ResponseEntity.ok(ApiResponse.ok("پیام خوانده شد",
                inboxService.markRead(username, id)));
    }

    /** علامت‌گذاری همه پیام‌ها به‌عنوان خوانده‌شده */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Integer>> markAllRead() {
        String username = securityUtils.currentUsername();
        return ResponseEntity.ok(ApiResponse.ok("همه پیام‌ها خوانده شد",
                inboxService.markAllRead(username)));
    }
}
