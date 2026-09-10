package com.example.project.landing.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * محتوای صفحه معرفی سیستم (لندینگ) — ذخیره‌سازی key-value
 * کلیدها: HERO, CITIES, PLACES, HOTELS, FOODS, VEHICLES
 * مقدار هر کلید یک رشته JSON است که توسط پنل مدیریت قابل ویرایش است.
 */
@Entity
@Table(name = "landing_contents",
        uniqueConstraints = @UniqueConstraint(name = "uk_landing_content_key", columnNames = "content_key"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandingContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_key", nullable = false, length = 50)
    private String contentKey;

    @Column(name = "content_value", nullable = false, columnDefinition = "TEXT")
    private String contentValue;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
