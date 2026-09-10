package com.example.project.user_reservation.controller;

import com.example.project.ceo_tour.station.dto.ApiResponse;
import com.example.project.user_reservation.dto.*;
import com.example.project.user_reservation.services.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReservationResponseDto>> create(
            @Valid @RequestBody CreateReservationRequestDto request) {
        log.info("POST /api/user/reservations - Creating reservation");
        var data = reservationService.createReservation(currentUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("رزرو با موفقیت ایجاد شد. لطفاً ظرف 12 ساعت رسید پرداخت را آپلود کنید.", data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReservationResponseDto>>> getMyReservations() {
        log.debug("GET /api/user/reservations - Fetching my reservations");
        var data = reservationService.getMyReservations(currentUsername());
        return ResponseEntity.ok(ApiResponse.ok("لیست رزروهای من", data));
    }

    @GetMapping("/{reservationId}")
    public ResponseEntity<ApiResponse<ReservationResponseDto>> getById(@PathVariable Long reservationId) {
        log.debug("GET /api/user/reservations/{} - Fetching reservation", reservationId);
        var data = reservationService.getReservationById(currentUsername(), reservationId);
        return ResponseEntity.ok(ApiResponse.ok("جزئیات رزرو", data));
    }

    // لغو رزرو با RequestBody (روش صحیح)
    @PostMapping("/{reservationId}/cancel")
    public ResponseEntity<ApiResponse<CancelReservationResponseDto>> cancelReservation(
            @PathVariable Long reservationId,
            @Valid @RequestBody CancelReservationRequestDto request) {
        log.info("POST /api/user/reservations/{}/cancel - Cancelling reservation", reservationId);
        var data = reservationService.cancelReservation(currentUsername(), reservationId, request);
        return ResponseEntity.ok(ApiResponse.ok("رزرو با موفقیت لغو شد", data));
    }

    // آپلود رسید پرداخت
    @PostMapping("/{reservationId}/payment-proof")
    public ResponseEntity<ApiResponse<Void>> uploadPaymentProof(
            @PathVariable Long reservationId,
            @Valid @RequestBody PaymentProofRequestDto request) {
        log.info("POST /api/user/reservations/{}/payment-proof - Uploading payment proof", reservationId);
        reservationService.uploadPaymentProof(currentUsername(), reservationId, request);
        return ResponseEntity.ok(ApiResponse.ok("رسید پرداخت با موفقیت آپلود شد. در انتظار تأیید مدیر آژانس.", null));
    }

    // ===== سیستم جدید کنسلی (چند مرحله‌ای) =====

    // 1. کاربر درخواست کنسلی می‌دهد
    @PostMapping("/{reservationId}/cancel-request")
    public ResponseEntity<ApiResponse<RefundRequestResponseDto>> requestCancellation(
            @PathVariable Long reservationId,
            @Valid @RequestBody CancelRequestDto request) {
        log.info("POST /api/user/reservations/{}/cancel-request - Cancel request", reservationId);
        var data = reservationService.requestCancellation(currentUsername(), reservationId, request);
        return ResponseEntity.ok(ApiResponse.ok("درخواست لغو با موفقیت ثبت شد و به مدیر آژانس ارسال گردید.", data));
    }

    // 2. کاربر وضعیت درخواست کنسلی را بررسی می‌کند
    @GetMapping("/{reservationId}/cancel-status")
    public ResponseEntity<ApiResponse<RefundRequestResponseDto>> getCancelStatus(
            @PathVariable Long reservationId) {
        log.debug("GET /api/user/reservations/{}/cancel-status - Fetching cancel status", reservationId);
        var data = reservationService.getRefundRequestStatus(currentUsername(), reservationId);
        return ResponseEntity.ok(ApiResponse.ok("وضعیت درخواست لغو", data));
    }

    // ===== بلیط گرافیکی =====

    // دریافت داده‌های بلیط برای رزرو تأییدشده
    @GetMapping("/{reservationId}/ticket")
    public ResponseEntity<ApiResponse<TicketResponseDto>> getTicket(@PathVariable Long reservationId) {
        log.debug("GET /api/user/reservations/{}/ticket - Fetching ticket", reservationId);
        var data = reservationService.getTicket(currentUsername(), reservationId);
        return ResponseEntity.ok(ApiResponse.ok("بلیط صادر شد", data));
    }

    // 3. کاربر پس از مشاهده رسید CEO، تایید نهایی می‌کند
    @PostMapping("/confirm-cancel/{refundRequestId}")
    public ResponseEntity<ApiResponse<RefundRequestResponseDto>> confirmCancellation(
            @PathVariable Long refundRequestId) {
        log.info("POST /api/user/reservations/confirm-cancel/{} - Confirming cancellation", refundRequestId);
        var data = reservationService.confirmCancellation(currentUsername(), refundRequestId);
        return ResponseEntity.ok(ApiResponse.ok("لغو رزرو با موفقیت تایید شد.", data));
    }
}