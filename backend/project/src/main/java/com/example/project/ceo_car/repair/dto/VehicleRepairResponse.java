package com.example.project.ceo_car.repair.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * سرویس/تعمیر ثبت‌شده در دفتر تعمیرات
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleRepairResponse {

    private Long id;
    private Long vehicleId;
    private String vehicleName;
    private String plateNumber;
    private LocalDate repairDate;
    private BigDecimal cost;
    private String repairType;         // ROUTINE_SERVICE / REPAIR / ACCIDENT / OTHER
    private String repairTypePersian;
    private String title;
    private String description;
    private String workshopName;
    private String createdBy;
    private LocalDateTime createdAt;
}
