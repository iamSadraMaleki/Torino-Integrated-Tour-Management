package com.example.project.ceo_food.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class IngredientDto {
    Long id;
    String ingredientName;
    String amount;
}
