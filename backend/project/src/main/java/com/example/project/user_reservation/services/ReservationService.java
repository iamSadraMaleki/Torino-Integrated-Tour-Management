package com.example.project.user_reservation.services;

import com.example.project.user_reservation.dto.*;

import java.util.List;

public interface ReservationService {

    // ایجاد رزرو جدید
    ReservationResponseDto createReservation(String username, CreateReservationRequestDto request);

    // دریافت رزروهای من
    List<ReservationResponseDto> getMyReservations(String username);

    // دریافت جزئیات یک رزرو
    ReservationResponseDto getReservationById(String username, Long reservationId);

    // لغو رزرو (با محاسبه جریمه بر اساس سیاست لغو)
    CancelReservationResponseDto cancelReservation(String username, Long reservationId, CancelReservationRequestDto request);

    // آپلود رسید پرداخت
    void uploadPaymentProof(String username, Long reservationId, PaymentProofRequestDto request);

    // ===== سیستم جدید کنسلی (چند مرحله‌ای) =====

    // 1. کاربر درخواست کنسلی می‌دهد (با شماره کارت و انتخاب مسافران)
    RefundRequestResponseDto requestCancellation(String username, Long reservationId, CancelRequestDto request);

    // 2. کاربر وضعیت درخواست کنسلی را بررسی می‌کند
    RefundRequestResponseDto getRefundRequestStatus(String username, Long reservationId);

    // 3. کاربر پس از مشاهده رسید CEO، تایید نهایی می‌کند
    RefundRequestResponseDto confirmCancellation(String username, Long refundRequestId);

    // ===== بلیط گرافیکی =====

    // دریافت داده‌های بلیط برای رزرو تأییدشده
    TicketResponseDto getTicket(String username, Long reservationId);
}