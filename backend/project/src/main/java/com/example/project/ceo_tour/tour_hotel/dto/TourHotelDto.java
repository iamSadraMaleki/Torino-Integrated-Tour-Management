package com.example.project.ceo_tour.tour_hotel.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class TourHotelDto {

    Long id;
    Long tourId;
    Long baseHotelId;
    String hotelName;
    String hotelCity;
    Integer hotelStars;
    Integer nightCount;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}

