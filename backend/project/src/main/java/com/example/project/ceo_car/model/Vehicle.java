package com.example.project.ceo_car.model;

import com.example.project.ceo_personel.model.StaffMember;
import com.example.project.users.model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "vehicles",
        indexes = {
                @Index(name = "idx_vehicle_user_id", columnList = "user_id"),
                @Index(name = "idx_vehicle_status", columnList = "status"),
                @Index(name = "idx_vehicle_type", columnList = "type"),
                @Index(name = "idx_vehicle_plate", columnList = "plate_number")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_plate", columnNames = {"user_id", "plate_number"})
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Size(min = 2, max = 100)
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @NotBlank
    @Size(min = 2, max = 100)
    @Column(name = "manufacturer", nullable = false, length = 100)
    private String manufacturer;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private VehicleType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private VehicleStatus status;

    @NotBlank
    @Pattern(regexp = "^\\d{2}[آ-یA-Z]{1}\\d{3}(ایران|Iran)$",  // ✅ اصلاح شده
            message = "فرمت پلاک صحیح نیست")
    @Column(name = "plate_number", nullable = false, length = 20)
    private String plateNumber;

    @NotBlank
    @Size(min = 2, max = 50)
    @Column(name = "color", nullable = false, length = 50)
    private String color;

    @NotNull
    @Min(value = 1)
    @Max(value = 20)
    @Column(name = "row_count", nullable = false)
    private Integer rowCount;

    @NotNull
    @Min(value = 4)
    @Max(value = 60)
    @Column(name = "seat_count", nullable = false)
    private Integer seatCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_driver_id")
    private StaffMember currentDriver;

    @Column(name = "model_year")
    private Integer modelYear;

    @Column(name = "description", length = 500)
    private String description;

    @ManyToMany
    @JoinTable(
            name = "vehicle_feature_mapping",  // ✅ تغییر نام جدول واسطه
            joinColumns = @JoinColumn(name = "vehicle_id"),
            inverseJoinColumns = @JoinColumn(name = "feature_id")
    )
    private Set<VehicleFeature> features = new HashSet<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = VehicleStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
