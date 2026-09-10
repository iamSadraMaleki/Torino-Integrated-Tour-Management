package com.example.project.user_reservation.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class RefundRequestResponseDto {
    Long id;
    Long reservationId;
    String tourName;
    String tourCode;
    BigDecimal refundAmount;
    String targetCardNumber;
    String receiptImageUrl;       // رسید برگشتی که CEO آپلود کرده
    String status;                // PENDING, REFUND_RECEIPT_UPLOADED, CONFIRMED, REJECTED
    String statusPersian;
    String rejectionReason;
    List<Long> cancelledPassengerIds;  // مسافران انتخاب شده برای لغو
    List<Long> cancelledSeatIds;       // صندلی‌های مربوطه
    String userUsername;
    String userMobile;
    LocalDateTime createdAt;
    LocalDateTime processedAt;
}
