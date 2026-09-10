package com.example.project.discount.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * کد تخفیف — توسط مدیر آژانس یا سوپرادمین ساخته می‌شود.
 * اگر forUserUsername تنظیم شده باشد، فقط همان کاربر می‌تواند استفاده کند
 * (مثلاً کدی که به اینباکس مسافر ارسال شده).
 */
@Entity
@Table(name = "discount_codes",
        indexes = {
                @Index(name = "idx_dc_active", columnList = "is_active"),
                @Index(name = "idx_dc_creator", columnList = "created_by_username")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "title", length = 200)
    private String title;

    /** درصد تخفیف (۱ تا ۹۹) */
    @Column(name = "discount_percent", nullable = false)
    private Integer discountPercent;

    /** حداکثر تعداد استفاده (null = نامحدود) */
    @Column(name = "max_uses")
    private Integer maxUses;

    @Builder.Default
    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /** اگر تنظیم باشد، فقط این کاربر می‌تواند استفاده کند */
    @Column(name = "for_user_username", length = 50)
    private String forUserUsername;

    @Column(name = "created_by_username", length = 50)
    private String createdByUsername;

    @Column(name = "created_by_role", length = 20)
    private String createdByRole;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
