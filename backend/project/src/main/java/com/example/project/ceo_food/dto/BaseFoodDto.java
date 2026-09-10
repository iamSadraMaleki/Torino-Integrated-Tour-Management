package com.example.project.ceo_food.dto;

import com.example.project.ceo_food.model.FoodType;
import com.example.project.ceo_food.model.MealType;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class BaseFoodDto {
    Long id;
    String name;
    FoodType foodType;
    MealType mealType;
    List<IngredientDto> ingredients;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
