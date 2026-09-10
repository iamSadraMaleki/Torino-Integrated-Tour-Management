package com.example.project.ceo_tour.tour.dto;

import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TourUpdateRequest {

    private LocalDate departureDate;
    private LocalDate returnDate;

    @Positive
    private BigDecimal price;

    private Integer capacity;
    private String description;
}
