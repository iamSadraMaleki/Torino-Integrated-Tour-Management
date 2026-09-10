package com.example.project.ceo_policy.model;

import com.example.project.users.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cancellation_policies",
        indexes = {
                @Index(name = "idx_policy_user", columnList = "user_id"),
                @Index(name = "idx_policy_is_default", columnList = "user_id, is_default")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancellationPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // مدیر آژانس

    @Column(name = "policy_name", nullable = false, length = 100)
    private String policyName;  // مثلاً "سیاست استاندارد" یا "سیاست سخت‌گیرانه"

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;  // توضیحات اختیاری

    /** بندهای لغو سیاست (هر بند: حداقل ساعت قبل از حرکت + درصد برگشت) */
    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("hoursBeforeDeparture ASC")
    @Builder.Default
    private List<CancellationPolicyClause> clauses = new ArrayList<>();

    /** فیلد قدیمی — برای سازگاری با داده‌های قبلی نگه داشته شده است */
    @Column(name = "hours_before_departure")
    private Integer hoursBeforeDeparture;  // چند ساعت قبل از حرکت

    /** فیلد قدیمی — برای سازگاری با داده‌های قبلی نگه داشته شده است */
    @Column(name = "refund_percentage")
    private BigDecimal refundPercentage;  // چند درصد برگشت داده شود (0 تا 100)

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;  // آیا این سیاست پیش‌فرض است؟

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;  // فعال/غیرفعال

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}