package com.example.project.ceo_tour.tour_food.dto;

import com.example.project.ceo_tour.tour_food.model.TourFood;
import org.springframework.stereotype.Component;

@Component
public class TourFoodMapper {

    public TourFoodDto toDto(TourFood entity) {
        return TourFoodDto.builder()
                .id(entity.getId())
                .tourId(entity.getTour().getId())
                .baseFoodId(entity.getBaseFood().getId())
                .foodName(entity.getBaseFood().getName())
                .foodType(entity.getBaseFood().getFoodType())
                .mealType(entity.getBaseFood().getMealType())
                .serveDay(entity.getServeDay())
                .price(entity.getPrice())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
