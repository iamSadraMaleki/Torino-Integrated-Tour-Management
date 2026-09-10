package com.example.project.discount.model;

import com.example.project.ceo_tour.tour.model.Tour;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * تخفیف ویژه (فلش‌سیل) روی یک تور — عمومی است و همه کاربران آن را در «تورهای ویژه» می‌بینند.
 */
@Entity
@Table(name = "tour_special_discounts",
        indexes = {
                @Index(name = "idx_tsd_tour", columnList = "tour_id"),
                @Index(name = "idx_tsd_active", columnList = "is_active"),
                @Index(name = "idx_tsd_expires", columnList = "expires_at")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourSpecialDiscount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    /** درصد تخفیف (۱ تا ۹۹) */
    @Column(name = "discount_percent", nullable = false)
    private Integer discountPercent;

    @Column(name = "starts_at", nullable = false)
    private LocalDateTime startsAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_by_username", length = 50)
    private String createdByUsername;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
