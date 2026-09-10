package com.example.project.ceo_car.repair.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * آمار دفتر تعمیرات — کل هزینه‌ها، تعداد سرویس‌ها، به تفکیک خودرو/نوع/ماه
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleRepairStatsResponse {

    private BigDecimal totalCost;
    private long repairCount;
    private long vehicleCount;

    /** به تفکیک خودرو */
    @Builder.Default
    private List<PerVehicle> perVehicle = List.of();

    /** به تفکیک نوع سرویس */
    @Builder.Default
    private List<PerType> perType = List.of();

    /** به تفکیک ماه */
    @Builder.Default
    private List<PerMonth> perMonth = List.of();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PerVehicle {
        private Long vehicleId;
        private String vehicleName;
        private String plateNumber;
        private BigDecimal totalCost;
        private long repairCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PerType {
        private String repairType;
        private String repairTypePersian;
        private BigDecimal totalCost;
        private long repairCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PerMonth {
        private String month;
        private BigDecimal totalCost;
        private long repairCount;
    }
}
