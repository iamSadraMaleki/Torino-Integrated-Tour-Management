package com.example.project.ceo_hotel.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class HotelDto {

    Long id;
    String name;
    String address;
    Integer stars;
    String city;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
