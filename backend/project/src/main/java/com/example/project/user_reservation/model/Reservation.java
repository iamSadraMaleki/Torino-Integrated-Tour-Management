package com.example.project.user_reservation.model;

import com.example.project.ceo_tour.tour.model.Tour;
import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations",
        indexes = {
                @Index(name = "idx_reservation_user", columnList = "user_id"),
                @Index(name = "idx_reservation_tour", columnList = "tour_id"),
                @Index(name = "idx_reservation_status", columnList = "status"),
                @Index(name = "idx_reservation_expires_at", columnList = "expires_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // کاربر رزروکننده

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @Column(name = "total_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalPrice;  // تعداد مسافر × قیمت تور (بعد از اعمال تخفیف‌ها)

    /** درصد تخفیف اعمال‌شده (تور ویژه یا کد) — برای مانیتورینگ */
    @Column(name = "discount_percent")
    private Integer discountPercent;

    /** مبلغ تخفیف اعمال‌شده */
    @Column(name = "discount_amount", precision = 15, scale = 2)
    private BigDecimal discountAmount;

    /** کد تخفیف استفاده‌شده (در صورت استفاده) */
    @Column(name = "discount_code", length = 50)
    private String discountCode;

    @Column(name = "passenger_count", nullable = false)
    private Integer passengerCount;  // تعداد مسافران

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ReservationStatus status = ReservationStatus.PENDING_PAYMENT;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;  // 12 ساعت بعد از ایجاد رزرو

    @Column(name = "canceled_at")
    private LocalDateTime canceledAt;  // زمان لغو (در صورت لغو)

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;  // زمان تأیید نهایی

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}