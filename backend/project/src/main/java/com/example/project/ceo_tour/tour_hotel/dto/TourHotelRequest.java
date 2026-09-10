package com.example.project.ceo_tour.tour_hotel.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TourHotelRequest {

    @NotNull(message = "Tour ID is required")
    private Long tourId;

    @NotNull(message = "Base hotel ID is required")
    private Long baseHotelId;

    @NotNull(message = "Night count is required")
    @Min(value = 1, message = "Night count must be at least 1")
    private Integer nightCount;
}

