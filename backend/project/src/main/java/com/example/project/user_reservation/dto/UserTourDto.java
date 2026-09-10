package com.example.project.user_reservation.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
public class UserTourDto {
    private Long id;
    private String baseTourName;
    private String baseTourCode;
    private String originCityName;
    private String destinationCityName;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private BigDecimal price;
    /** قیمت تخفیف‌خورده تور ویژه (در صورت فعال بودن) */
    private BigDecimal discountedPrice;
    /** درصد تخفیف ویژه فعال */
    private Integer discountPercent;
    private Integer availableCapacity;
    private String createdByUsername;
}