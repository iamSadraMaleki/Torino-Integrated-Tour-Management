package com.example.project.inbox.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.inbox.dto.InboxMessageResponse;
import com.example.project.inbox.dto.InboxSendRequest;
import com.example.project.inbox.services.InboxService;
import com.example.project.users.config.SecurityUtils;
import com.example.project.users.dto.UserDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * اینباکس — سمت سوپرادمین/ادمین: ارسال پیام خصوصی به کاربران و مدیریت تعلیق
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/inbox")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
public class AdminInboxController {

    private final InboxService inboxService;
    private final SecurityUtils securityUtils;

    /** ارسال پیام خصوصی به یک کاربر (می‌رود به اینباکس آن کاربر) */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<InboxMessageResponse>> send(
            @Valid @RequestBody InboxSendRequest request) {
        String admin = securityUtils.currentUsername();
        InboxMessageResponse data = inboxService.sendPrivateMessage(admin, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("پیام به اینباکس «" + request.getRecipientUsername() + "» ارسال شد", data));
    }

    /** رفع تعلیق حساب کاربر */
    @PostMapping("/{userId}/unsuspend")
    public ResponseEntity<ApiResponse<InboxMessageResponse>> unsuspend(@PathVariable Long userId) {
        String admin = securityUtils.currentUsername();
        InboxMessageResponse data = inboxService.unsuspend(admin, userId);
        return ResponseEntity.ok(ApiResponse.ok("حساب کاربر رفع تعلیق شد", data));
    }

    /** تاریخچه همه پیام‌های ارسال‌شده (بدانیم به کی چه چیزی ارسال شده) */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<com.example.project.inbox.dto.InboxHistoryResponse>>> getSendHistory() {
        return ResponseEntity.ok(ApiResponse.ok("تاریخچه پیام‌های ارسال‌شده",
                inboxService.getSendHistory()));
    }

    /** لیست کاربران معلق برای مدیریت رفع تعلیق */
    @GetMapping("/suspended-users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getSuspendedUsers() {
        return ResponseEntity.ok(ApiResponse.ok("لیست کاربران معلق",
                inboxService.getSuspendedUsers()));
    }
}
