package com.example.project.ceo_policy.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * بند لغو — هر سیاست لغو می‌تواند چندین بند داشته باشد.
 * هر بند مشخص می‌کند که در صورت لغو «حداقل X ساعت قبل از حرکت»، چند درصد مبلغ برگشت داده شود.
 */
@Entity
@Table(name = "cancellation_policy_clauses",
        indexes = {
                @Index(name = "idx_clause_policy", columnList = "policy_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancellationPolicyClause {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "policy_id", nullable = false)
    private CancellationPolicy policy;

    /** حداقل ساعت قبل از حرکت (آستانه بند) */
    @Column(name = "hours_before_departure", nullable = false)
    private Integer hoursBeforeDeparture;

    /** درصد برگشت مبلغ (0 تا 100) */
    @Column(name = "refund_percentage", nullable = false)
    private BigDecimal refundPercentage;
}
