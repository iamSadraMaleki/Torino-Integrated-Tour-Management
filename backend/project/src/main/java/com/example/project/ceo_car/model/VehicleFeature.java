package com.example.project.ceo_car.model;

import com.example.project.users.model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_features",
        indexes = {
                @Index(name = "idx_feature_user_id", columnList = "user_id"),
                @Index(name = "idx_feature_name", columnList = "name")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_feature_name", columnNames = {"user_id", "name"})
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VehicleFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // CEO که این ویژگی رو تعریف کرده

    @NotBlank
    @Size(min = 2, max = 100)
    @Column(name = "name", nullable = false, length = 100)
    private String name; // نام ویژگی (مثلاً: سیستم صوتی، پذیرایی، WiFi، ...)

    @Column(name = "description", length = 500)
    private String description; // توضیحات ویژگی

    @Column(name = "icon", length = 50)
    private String icon; // آیکون (اختیاری)

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // فعال/غیرفعال

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

