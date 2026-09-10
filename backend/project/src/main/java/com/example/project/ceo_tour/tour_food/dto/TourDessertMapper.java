package com.example.project.ceo_tour.tour_food.dto;


import com.example.project.ceo_tour.tour_food.model.TourDessert;
import org.springframework.stereotype.Component;

@Component
public class TourDessertMapper {

    public TourDessertDto toDto(TourDessert entity) {
        return TourDessertDto.builder()
                .id(entity.getId())
                .tourId(entity.getTour().getId())
                .baseFoodId(entity.getBaseFood().getId())
                .dessertName(entity.getBaseFood().getName())
                .foodType(entity.getBaseFood().getFoodType())
                .mealType(entity.getBaseFood().getMealType())
                .serveDay(entity.getServeDay())
                .price(entity.getPrice())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

