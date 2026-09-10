package com.example.project.ceo_tour.tour_hotel.dto;

import com.example.project.ceo_tour.tour_hotel.model.TourHotel;
import org.springframework.stereotype.Component;

@Component
public class TourHotelMapper {

    public TourHotelDto toDto(TourHotel tourHotel) {
        return TourHotelDto.builder()
                .id(tourHotel.getId())
                .tourId(tourHotel.getTour().getId())
                .baseHotelId(tourHotel.getBaseHotel().getId())
                .hotelName(tourHotel.getBaseHotel().getName())
                .hotelCity(tourHotel.getBaseHotel().getCity())
                .hotelStars(tourHotel.getBaseHotel().getStars())
                .nightCount(tourHotel.getNightCount())
                .createdAt(tourHotel.getCreatedAt())
                .updatedAt(tourHotel.getUpdatedAt())
                .build();
    }
}

