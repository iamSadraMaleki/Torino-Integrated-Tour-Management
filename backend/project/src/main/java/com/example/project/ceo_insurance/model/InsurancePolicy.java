package com.example.project.ceo_insurance.model;

import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * بیمه سفر — بیمه‌نامه‌های قابل استفاده در تورها (هر مدیر آژانس)
 */
@Entity
@Table(name = "insurance_policies",
        indexes = {
                @Index(name = "idx_insurance_user", columnList = "user_id"),
                @Index(name = "idx_insurance_type", columnList = "insurance_type")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsurancePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** نام بیمه‌نامه / شرکت بیمه */
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "insurance_type", nullable = false, length = 30)
    private InsurancePolicyType insuranceType;

    /** مبلغ پوشش بیمه */
    @Column(name = "coverage_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal coverageAmount;

    /** هزینه بیمه برای هر نفر */
    @Column(name = "premium", nullable = false, precision = 15, scale = 2)
    private BigDecimal premium;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (coverageAmount == null) coverageAmount = BigDecimal.ZERO;
        if (premium == null) premium = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
