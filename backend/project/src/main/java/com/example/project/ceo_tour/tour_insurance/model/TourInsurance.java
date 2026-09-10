package com.example.project.ceo_tour.tour_insurance.model;

import com.example.project.ceo_insurance.model.InsurancePolicy;
import com.example.project.ceo_tour.tour.model.Tour;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * بیمه‌ای که به یک تور اختصاص داده شده — با قیمت هر نفر برای آن تور
 */
@Entity
@Table(name = "tour_insurance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourInsurance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insurance_policy_id", nullable = false)
    private InsurancePolicy insurancePolicy;

    /** هزینه بیمه برای هر نفر در این تور */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (price == null) price = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
