package com.example.project.ceo_food.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class IngredientRequest {

    @NotBlank(message = "Ingredient name is required")
    @Size(max = 100, message = "Ingredient name must be at most 100 characters")
    private String ingredientName;

    @Size(max = 50, message = "Amount must be at most 50 characters")
    private String amount;
}
