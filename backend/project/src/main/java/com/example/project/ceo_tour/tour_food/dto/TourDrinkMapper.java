package com.example.project.ceo_tour.tour_food.dto;

import com.example.project.ceo_tour.tour_food.model.TourDrink;
import org.springframework.stereotype.Component;

@Component
public class TourDrinkMapper {

    public TourDrinkDto toDto(TourDrink entity) {
        return TourDrinkDto.builder()
                .id(entity.getId())
                .tourId(entity.getTour().getId())
                .baseFoodId(entity.getBaseFood().getId())
                .drinkName(entity.getBaseFood().getName())
                .foodType(entity.getBaseFood().getFoodType())
                .mealType(entity.getBaseFood().getMealType())
                .serveDay(entity.getServeDay())
                .price(entity.getPrice())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
