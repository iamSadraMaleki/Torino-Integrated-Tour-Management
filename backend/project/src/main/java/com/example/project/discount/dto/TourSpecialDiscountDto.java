package com.example.project.discount.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class TourSpecialDiscountDto {
    private Long id;
    private Long tourId;
    private String tourName;
    private String tourCode;
    private BigDecimal originalPrice;
    private BigDecimal discountedPrice;
    private Integer discountPercent;
    private LocalDateTime startsAt;
    private LocalDateTime expiresAt;
    private Boolean isActive;
    private String createdByUsername;
    private LocalDateTime createdAt;
}
