package com.example.project.ceo_tour.tour_car.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * تاریخچه سفرهای یک خودرو — تورهایی که در آن‌ها تخصیص داده شده
 */
@Data
@Builder
public class VehicleTourHistoryResponseDTO {

    private Long id;
    private Long tourId;
    private String tourName;
    private String tourCode;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private LocalDateTime assignedAt;
}
