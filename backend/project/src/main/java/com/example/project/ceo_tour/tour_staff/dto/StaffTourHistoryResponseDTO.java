package com.example.project.ceo_tour.tour_staff.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * تاریخچه سفرهای یک کارمند — تورهایی که در آن‌ها تخصیص داده شده
 */
@Data
@Builder
public class StaffTourHistoryResponseDTO {

    private Long id;
    private Long tourId;
    private String tourName;
    private String tourCode;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private BigDecimal paymentAmount;
    private LocalDateTime assignedAt;
}
