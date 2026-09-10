package com.example.project.wishlist.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class WishlistItemDto {
    private Long id;
    private Long tourId;
    private String baseTourName;
    private String baseTourCode;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private BigDecimal price;
    private Integer availableCapacity;
    private String createdByUsername;
    private LocalDateTime createdAt;
}
