package com.example.project.ceo_tour.tour_food.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TourDessertResponseDTO {

    private Long id;

    private Long tourId;

    private Long baseFoodId;

    private String dessertName;

    private String serveDay;

    private BigDecimal price;
}