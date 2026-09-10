package com.example.project.ticket.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.ticket.dto.*;
import com.example.project.ticket.services.TicketService;
import com.example.project.users.config.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * مدیریت تیکت‌ها — سمت سوپرادمین/ادمین
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/tickets")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
public class AdminTicketController {

    private final TicketService ticketService;
    private final SecurityUtils securityUtils;

    /** همه تیکت‌ها (با اولویت‌بندی) */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getAll() {
        String admin = securityUtils.currentUsername();
        return ResponseEntity.ok(ApiResponse.ok("همه تیکت‌ها", ticketService.getAll(admin)));
    }

    /** آمار و نمودار عملکرد پشتیبانی */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<TicketStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok("آمار پشتیبانی", ticketService.getStats()));
    }

    /** لیست اپراتورها (ادمین‌ها) برای تخصیص */
    @GetMapping("/operators")
    public ResponseEntity<ApiResponse<List<String>>> getOperators() {
        return ResponseEntity.ok(ApiResponse.ok("لیست اپراتورها", ticketService.getOperators()));
    }

    /** جزئیات تیکت */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicket(@PathVariable Long id) {
        String admin = securityUtils.currentUsername();
        return ResponseEntity.ok(ApiResponse.ok("جزئیات تیکت", ticketService.getTicket(admin, id)));
    }

    /** تاریخچه پیام‌ها */
    @GetMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<List<TicketMessageResponse>>> getMessages(@PathVariable Long id) {
        String admin = securityUtils.currentUsername();
        return ResponseEntity.ok(ApiResponse.ok("تاریخچه گفتگو", ticketService.getMessages(admin, id)));
    }

    /** پاسخ مستقیم پشتیبانی */
    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<TicketMessageResponse>> reply(
            @PathVariable Long id,
            @Valid @RequestBody TicketReplyRequest request) {
        String admin = securityUtils.currentUsername();
        TicketMessageResponse data = ticketService.sendMessage(admin, id, request);
        return ResponseEntity.ok(ApiResponse.ok("پاسخ ارسال شد", data));
    }

    /** تخصیص تیکت به اپراتور */
    @PutMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<TicketResponse>> assign(
            @PathVariable Long id,
            @Valid @RequestBody TicketAssignRequest request) {
        String admin = securityUtils.currentUsername();
        TicketResponse data = ticketService.assign(admin, id, request.getOperatorUsername());
        return ResponseEntity.ok(ApiResponse.ok("تیکت به اپراتور «" + request.getOperatorUsername() + "» تخصیص یافت", data));
    }

    /** بستن تیکت با ثبت دلیل */
    @PutMapping("/{id}/close")
    public ResponseEntity<ApiResponse<TicketResponse>> close(
            @PathVariable Long id,
            @Valid @RequestBody TicketCloseRequest request) {
        String admin = securityUtils.currentUsername();
        TicketResponse data = ticketService.close(admin, id, request.getReason());
        return ResponseEntity.ok(ApiResponse.ok("تیکت بسته شد", data));
    }
}
