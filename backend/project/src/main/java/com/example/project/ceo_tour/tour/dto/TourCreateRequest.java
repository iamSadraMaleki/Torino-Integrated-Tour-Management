package com.example.project.ceo_tour.tour.dto;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TourCreateRequest {

    @NotNull
    private Long baseTourId;

    @NotNull
    private LocalDate departureDate;

    @NotNull
    private LocalDate returnDate;

    @NotNull
    @Positive
    private BigDecimal price;

    private Integer capacity;

    private String description;
}
