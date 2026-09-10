package com.example.project.user_reservation.controller;


import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.user_reservation.dto.*;
import com.example.project.user_reservation.services.CeoReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/ceo")
@RequiredArgsConstructor
public class CeoReservationController {

    private final CeoReservationService ceoReservationService;

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // ===== مدیریت رزروها =====

    @GetMapping("/reservations/pending")
    public ResponseEntity<ApiResponse<List<ReservationResponseDto>>> getPendingReservations() {
        log.debug("GET /api/ceo/reservations/pending");
        var data = ceoReservationService.getPendingReservations(currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("لیست رزروهای در انتظار تأیید", data));
    }

    @GetMapping("/reservations")
    public ResponseEntity<ApiResponse<List<ReservationResponseDto>>> getMyTourReservations() {
        log.debug("GET /api/ceo/reservations");
        var data = ceoReservationService.getMyTourReservations(currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("لیست رزروهای تورهای من", data));
    }

    @PostMapping("/reservations/approve")
    public ResponseEntity<ApiResponse<ReservationResponseDto>> approveReservation(
            @Valid @RequestBody VerifyPaymentRequestDto request) {
        log.info("POST /api/ceo/reservations/approve");
        var data = ceoReservationService.approveReservation(currentUsername(), request.getReservationId());
        return ResponseEntity.ok(ApiResponse.ok("رزرو با موفقیت تأیید شد", data));
    }

    @PostMapping("/reservations/reject")
    public ResponseEntity<ApiResponse<ReservationResponseDto>> rejectReservation(
            @Valid @RequestBody VerifyPaymentRequestDto request) {
        log.info("POST /api/ceo/reservations/reject");
        var data = ceoReservationService.rejectReservation(currentUsername(), request.getReservationId(), request.getRejectionReason());
        return ResponseEntity.ok(ApiResponse.ok("رزرو رد شد", data));
    }

    // ===== سیستم جدید کنسلی (مدیریت درخواست‌های لغو) =====

    // 1. CEO درخواست‌های کنسلی pending رو می‌بینه
    @GetMapping("/cancel-requests")
    public ResponseEntity<ApiResponse<List<RefundRequestResponseDto>>> getPendingCancelRequests() {
        log.debug("GET /api/ceo/cancel-requests");
        var data = ceoReservationService.getPendingCancelRequests(currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("لیست درخواست‌های لغو", data));
    }

    // 2. CEO رسید برگشت وجه رو آپلود می‌کنه
    @PostMapping("/cancel-requests/upload-receipt")
    public ResponseEntity<ApiResponse<RefundRequestResponseDto>> uploadRefundReceipt(
            @Valid @RequestBody CeoRefundReceiptDto request) {
        log.info("POST /api/ceo/cancel-requests/upload-receipt");
        var data = ceoReservationService.uploadRefundReceipt(currentUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("رسید برگشت وجه با موفقیت آپلود شد. در انتظار تایید مسافر.", data));
    }

    // 3. CEO درخواست کنسلی رو رد می‌کنه
    @PostMapping("/cancel-requests/reject")
    public ResponseEntity<ApiResponse<RefundRequestResponseDto>> rejectCancelRequest(
            @Valid @RequestBody CeoRejectRefundDto request) {
        log.info("POST /api/ceo/cancel-requests/reject");
        var data = ceoReservationService.rejectCancelRequest(currentUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("درخواست لغو رد شد.", data));
    }
}
