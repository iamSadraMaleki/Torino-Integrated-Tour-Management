package com.example.project.user_reservation.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_proofs",
        indexes = {
                @Index(name = "idx_payment_reservation", columnList = "reservation_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentProof {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reservation_id", nullable = false, unique = true)
    private Reservation reservation;

    @Column(name = "source_card_number", nullable = false, length = 16)
    private String sourceCardNumber;  // شماره کارت مبدأ (خریدار)

    @Column(name = "destination_card_number", nullable = false, length = 16)
    private String destinationCardNumber;  // شماره کارت مقصد (CEO)

    @Column(name = "receipt_image_url", nullable = false, columnDefinition = "TEXT")
    private String receiptImageUrl;  // آدرس عکس رسید

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;  // زمان تأیید توسط CEO

    @Column(name = "verified_by")
    private Long verifiedBy;  // ID مدیر آژانسی که تأیید کرده

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;  // دلیل رد (در صورت رد شدن)

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
