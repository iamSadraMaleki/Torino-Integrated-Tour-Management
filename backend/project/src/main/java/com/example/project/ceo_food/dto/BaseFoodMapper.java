package com.example.project.ceo_food.dto;

import com.example.project.ceo_food.model.BaseFood;
import com.example.project.ceo_food.model.BaseFoodIngredient;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class BaseFoodMapper {

    public BaseFoodDto toDto(BaseFood food) {
        List<IngredientDto> ingredientDtos = food.getIngredients() == null
                ? List.of()
                : food.getIngredients().stream()
                .map(this::toIngredientDto)
                .collect(Collectors.toUnmodifiableList());

        return BaseFoodDto.builder()
                .id(food.getId())
                .name(food.getName())
                .foodType(food.getFoodType())
                .mealType(food.getMealType())
                .ingredients(ingredientDtos)
                .createdAt(food.getCreatedAt())
                .updatedAt(food.getUpdatedAt())
                .build();
    }

    private IngredientDto toIngredientDto(BaseFoodIngredient ingredient) {
        return IngredientDto.builder()
                .id(ingredient.getId())
                .ingredientName(ingredient.getIngredientName())
                .amount(ingredient.getAmount())
                .build();
    }

    public BaseFoodIngredient toIngredientEntity(IngredientRequest request, BaseFood food) {
        return BaseFoodIngredient.builder()
                .baseFood(food)
                .ingredientName(request.getIngredientName())
                .amount(request.getAmount())
                .build();
    }
}
