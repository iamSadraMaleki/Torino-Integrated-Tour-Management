package com.example.project.ceo_car.repair.model;

import com.example.project.ceo_car.model.Vehicle;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * دفتر تعمیرات خودرو — هر ردیف یک سرویس/تعمیر انجام‌شده روی یک خودرو
 */
@Entity
@Table(name = "vehicle_repair_records",
        indexes = {
                @Index(name = "idx_repair_vehicle", columnList = "vehicle_id"),
                @Index(name = "idx_repair_date", columnList = "repair_date"),
                @Index(name = "idx_repair_type", columnList = "repair_type")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleRepairRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "repair_date", nullable = false)
    private LocalDate repairDate;

    @Column(name = "cost", nullable = false, precision = 15, scale = 2)
    private BigDecimal cost;

    @Enumerated(EnumType.STRING)
    @Column(name = "repair_type", nullable = false, length = 30)
    private VehicleRepairType repairType;

    /** دلیل/عنوان سرویس — مثلاً «تعویض روغن»، «تعمیر ترمز» */
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** نام تعمیرگاه / مکانیک */
    @Column(name = "workshop_name", length = 150)
    private String workshopName;

    /** نام کاربری مدیر آژانس ثبت‌کننده */
    @Column(name = "created_by", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (repairDate == null) {
            repairDate = LocalDate.now();
        }
    }
}
