package com.example.project.user_reservation.services;

import com.example.project.user_reservation.dto.CeoRefundReceiptDto;
import com.example.project.user_reservation.dto.CeoRejectRefundDto;
import com.example.project.user_reservation.dto.RefundRequestResponseDto;
import com.example.project.user_reservation.dto.ReservationResponseDto;
import java.util.List;

public interface CeoReservationService {

    // دریافت رزروهای در انتظار تأیید برای CEO
    List<ReservationResponseDto> getPendingReservations(String username);

    // تأیید رزرو و کاهش ظرفیت
    ReservationResponseDto approveReservation(String username, Long reservationId);

    // رد رزرو
    ReservationResponseDto rejectReservation(String username, Long reservationId, String reason);

    // دریافت همه رزروهای تورهای من
    List<ReservationResponseDto> getMyTourReservations(String username);

    // ===== سیستم جدید کنسلی (مدیریت CEO) =====

    // 1. CEO درخواست‌های کنسلی pending رو می‌بینه
    List<RefundRequestResponseDto> getPendingCancelRequests(String username);

    // 2. CEO رسید برگشت وجه رو آپلود می‌کنه
    RefundRequestResponseDto uploadRefundReceipt(String username, CeoRefundReceiptDto request);

    // 3. CEO درخواست کنسلی رو رد می‌کنه
    RefundRequestResponseDto rejectCancelRequest(String username, CeoRejectRefundDto request);
}