package com.example.project.ceo_tour.tour_food.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AddTourFoodDTO {

    private Long tourId;
    private Long baseFoodId;
    private String serveDay;
    private BigDecimal price;
}
