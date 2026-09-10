package com.example.project.user_reservation.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class FoodDto {
    Long id;
    String name;
    String type;
    String description;
}
