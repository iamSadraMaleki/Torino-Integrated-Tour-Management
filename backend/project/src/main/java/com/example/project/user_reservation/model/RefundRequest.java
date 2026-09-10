package com.example.project.user_reservation.model;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "refund_requests",
        indexes = {
                @Index(name = "idx_refund_reservation", columnList = "reservation_id"),
                @Index(name = "idx_refund_status", columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(name = "refund_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal refundAmount;  // مبلغ برگشتی (طبق سیاست لغو)

    @Column(name = "target_card_number", nullable = false, length = 16)
    private String targetCardNumber;  // شماره کارتی که کاربر برای برگشت پول وارد کرده

    @Column(name = "receipt_image_url", columnDefinition = "TEXT")
    private String receiptImageUrl;  // آدرس عکس رسید برگشت پول (CEO آپلود می‌کنه) - base64 یا URL بلند

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private RefundStatus status = RefundStatus.PENDING;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;  // زمان پردازش نهایی

    @Column(name = "processed_by")
    private Long processedBy;  // ID مدیر آژانسی که پردازش کرده

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    // ===== پشتیبانی از لغو انتخابی (تک نفره یا گروهی) =====
    @Column(name = "cancelled_passenger_ids", columnDefinition = "TEXT")
    private String cancelledPassengerIds;  // JSON آرایه از ID مسافران برای لغو انتخابی (خالی = کل رزرو)

    @Column(name = "cancelled_seat_ids", columnDefinition = "TEXT")
    private String cancelledSeatIds;  // JSON آرایه از ID صندلی‌های مربوطه

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
