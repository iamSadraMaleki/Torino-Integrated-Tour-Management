package com.example.project.ceo_car.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleStatisticsDto {
    private Long totalVehicles;           // تعداد کل ماشین‌ها
    private Long activeVehicles;          // تعداد ماشین‌های فعال
    private Long underRepairVehicles;     // تعداد ماشین‌های در تعمیر
    private Long inactiveVehicles;        // تعداد ماشین‌های غیرفعال
    private Map<String, Long> vehiclesByType;         // به تفکیک نوع
    private Map<String, Long> vehiclesByManufacturer; // به تفکیک شرکت
    private Map<String, Long> vehiclesByStatus;       // به تفکیک وضعیت
    private Integer totalSeats;           // تعداد کل صندلی‌ها
}

