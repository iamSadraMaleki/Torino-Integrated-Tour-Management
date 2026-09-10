package com.example.project.ceo_personel.payment.model;

import com.example.project.ceo_personel.model.StaffMember;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * دفتر پرداخت حقوق کارکنان — هر ردیف یک پرداخت (حقوق یا پاداش) به یک کارمند
 */
@Entity
@Table(name = "staff_payments",
        indexes = {
                @Index(name = "idx_staff_payment_staff", columnList = "staff_member_id"),
                @Index(name = "idx_staff_payment_date", columnList = "payment_date"),
                @Index(name = "idx_staff_payment_type", columnList = "payment_type")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "staff_member_id", nullable = false)
    private StaffMember staffMember;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 20)
    private StaffPaymentType paymentType;

    /** عنوان پرداخت — مثلاً «حقوق فروردین» یا «پاداش عملکرد» */
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    /** نام کاربری مدیر آژانس ثبت‌کننده */
    @Column(name = "created_by", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (paymentDate == null) {
            paymentDate = LocalDate.now();
        }
    }
}
