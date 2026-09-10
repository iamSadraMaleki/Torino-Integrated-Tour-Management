package com.example.project.ceo_tour.tour_food.dto;

import com.example.project.ceo_food.model.MealType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TourFoodResponseDTO {

    private Long id;

    private Long tourId;

    private Long baseFoodId;

    private String foodName;

    private MealType mealType;  // مثلا LUNCH

    private String serveDay;

    private BigDecimal price;
}
