package com.example.project.ticket.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.ticket.dto.TicketCreateRequest;
import com.example.project.ticket.dto.TicketMessageResponse;
import com.example.project.ticket.dto.TicketReplyRequest;
import com.example.project.ticket.dto.TicketResponse;
import com.example.project.ticket.services.TicketService;
import com.example.project.users.config.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * تیکت پشتیبانی — سمت مسافر و مدیر آژانس
 */
@Slf4j
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final SecurityUtils securityUtils;

    /** ثبت تیکت جدید */
    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> create(
            @Valid @RequestBody TicketCreateRequest request) {
        String username = securityUtils.currentUsername();
        log.info("Ticket create request from: {}", username);
        TicketResponse data = ticketService.create(username, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("تیکت با شماره " + data.getSerialNumber() + " ثبت شد", data));
    }

    /** لیست تیکت‌های من */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getMyTickets() {
        String username = securityUtils.currentUsername();
        return ResponseEntity.ok(ApiResponse.ok("لیست تیکت‌های من",
                ticketService.getMyTickets(username)));
    }

    /** جزئیات یک تیکت (فقط مالک یا ادمین) */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicket(@PathVariable Long id) {
        String username = securityUtils.currentUsername();
        return ResponseEntity.ok(ApiResponse.ok("جزئیات تیکت",
                ticketService.getTicket(username, id)));
    }

    /** تاریخچه پیام‌های تیکت */
    @GetMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<List<TicketMessageResponse>>> getMessages(@PathVariable Long id) {
        String username = securityUtils.currentUsername();
        return ResponseEntity.ok(ApiResponse.ok("تاریخچه گفتگو",
                ticketService.getMessages(username, id)));
    }

    /** ارسال پیام در تیکت */
    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<TicketMessageResponse>> sendMessage(
            @PathVariable Long id,
            @Valid @RequestBody TicketReplyRequest request) {
        String username = securityUtils.currentUsername();
        TicketMessageResponse data = ticketService.sendMessage(username, id, request);
        return ResponseEntity.ok(ApiResponse.ok("پیام ارسال شد", data));
    }
}
