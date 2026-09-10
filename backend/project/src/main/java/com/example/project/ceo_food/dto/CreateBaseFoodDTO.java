package com.example.project.ceo_food.dto;

import com.example.project.ceo_food.model.FoodType;
import com.example.project.ceo_food.model.MealType;
import lombok.Data;

import java.util.List;

@Data
public class CreateBaseFoodDTO {

    private String name;
    private FoodType foodType;
    private MealType mealType;
    private List<IngredientDto> ingredients;
}
