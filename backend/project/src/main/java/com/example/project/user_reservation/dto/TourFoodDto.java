package com.example.project.user_reservation.dto;

import lombok.Builder;
import lombok.Value;
import java.math.BigDecimal;

@Value
@Builder
public class TourFoodDto {
    Long id;
    Long foodId;
    String foodName;
    String foodType;
    String serveDay;
    BigDecimal price;
}