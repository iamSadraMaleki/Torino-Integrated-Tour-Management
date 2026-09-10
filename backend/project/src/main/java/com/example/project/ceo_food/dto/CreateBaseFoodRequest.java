package com.example.project.ceo_food.dto;

import com.example.project.ceo_food.model.FoodType;
import com.example.project.ceo_food.model.MealType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CreateBaseFoodRequest {

    @NotBlank(message = "Food name is required")
    @Size(min = 2, max = 100, message = "Food name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Food type is required")
    private FoodType foodType;

    @NotNull(message = "Meal type is required")
    private MealType mealType;

    @Valid
    private List<IngredientRequest> ingredients = new ArrayList<>();
}
