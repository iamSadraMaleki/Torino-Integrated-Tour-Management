package com.example.project.ceo_tour.tour_food.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TourDrinkResponseDTO {

    private Long id;

    private Long tourId;

    private Long baseFoodId;

    private String drinkName;

    private String serveDay;

    private BigDecimal price;
}
