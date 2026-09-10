package com.example.project.tour_chat.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.tour_chat.dto.ChatWarningResponse;
import com.example.project.tour_chat.dto.TourChatCreateRequest;
import com.example.project.tour_chat.dto.TourChatEditRequest;
import com.example.project.tour_chat.dto.TourChatMessageResponse;
import com.example.project.tour_chat.dto.TourChatSendRequest;
import com.example.project.tour_chat.dto.TourConversationResponse;
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
 * گفتگوی مسافر با مدیر آژانس — سمت مسافر
 */
@Slf4j
@RestController
@RequestMapping("/api/user/tour-chat")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_USER')")
public class UserTourChatController {

    private final TourChatService tourChatService;
    private final SecurityUtils securityUtils;

    /** شروع گفتگو با مدیر آژانس برای یک تور (ایجاد یا بازیابی) */
    @PostMapping
    public ResponseEntity<ApiResponse<TourConversationResponse>> start(
            @Valid @RequestBody TourChatCreateRequest request) {
        String username = securityUtils.currentUsername();
        TourConversationResponse data = tourChatService.startConversation(username, request.getTourId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("گفتگو با مدیر آژانس آغاز شد", data));
    }

    /** لیست گفتگوهای من */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<TourConversationResponse>>> getMyConversations() {
        String username = securityUtils.currentUsername();
        return ResponseEntity.ok(ApiResponse.ok("لیست گفتگوها",
                tourChatService.getConversations(username)));
    }

    /** جزئیات گفتگو */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TourConversationResponse>> getConversation(@PathVariable Long id) {
        String username = securityUtils.currentUsername();
        return ResponseEntity.ok(ApiResponse.ok("جزئیات گفتگو",
                tourChatService.getConversation(username, id)));
    }

    /** پیام‌های گفتگو */
    @GetMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<List<TourChatMessageResponse>>> getMessages(@PathVariable Long id) {
        String username = securityUtils.currentUsername();
        return ResponseEntity.ok(ApiResponse.ok("تاریخچه گفتگو",
                tourChatService.getMessages(username, id)));
    }

    /** ارسال پیام */
    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<TourChatMessageResponse>> sendMessage(
            @PathVariable Long id,
            @Valid @RequestBody TourChatSendRequest request) {
        String username = securityUtils.currentUsername();
        TourChatMessageResponse data = tourChatService.sendMessage(username, id, request);
        return ResponseEntity.ok(ApiResponse.ok("پیام ارسال شد", data));
    }

    /** ویرایش پیام خود */
    @PutMapping("/{id}/messages/{messageId}")
    public ResponseEntity<ApiResponse<TourChatMessageResponse>> editMessage(
            @PathVariable Long id,
            @PathVariable Long messageId,
            @Valid @RequestBody TourChatEditRequest request) {
        String username = securityUtils.currentUsername();
        TourChatMessageResponse data = tourChatService.editMessage(username, messageId, request);
        return ResponseEntity.ok(ApiResponse.ok("پیام ویرایش شد", data));
    }

    /** حذف پیام خود (نرم) */
    @DeleteMapping("/{id}/messages/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable Long id,
            @PathVariable Long messageId) {
        String username = securityUtils.currentUsername();
        tourChatService.deleteMessage(username, messageId);
        return ResponseEntity.ok(ApiResponse.ok("پیام حذف شد", null));
    }

    /** اخطارهای صادرشده برای من */
    @GetMapping("/my/warnings")
    public ResponseEntity<ApiResponse<List<ChatWarningResponse>>> getMyWarnings() {
        String username = securityUtils.currentUsername();
        return ResponseEntity.ok(ApiResponse.ok("لیست اخطارها",
                tourChatService.getMyWarnings(username)));
    }
}
