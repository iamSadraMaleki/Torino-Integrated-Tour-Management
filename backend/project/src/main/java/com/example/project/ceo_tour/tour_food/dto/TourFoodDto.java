package com.example.project.ceo_tour.tour_food.dto;

import com.example.project.ceo_food.model.FoodType;
import com.example.project.ceo_food.model.MealType;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Value
@Builder
public class TourFoodDto {
    Long id;
    Long tourId;
    Long baseFoodId;
    String foodName;
    FoodType foodType;
    MealType mealType;
    String serveDay;
    BigDecimal price;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}

