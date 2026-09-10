package com.example.project.ceo_tour.tour_food.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class TourMenuByDayDto {
    String serveDay;
    List<TourFoodDto> foods;
}
