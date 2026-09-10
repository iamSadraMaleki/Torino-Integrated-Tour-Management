package com.example.project.ceo_hotel.dto;

import com.example.project.ceo_hotel.model.Hotel;
import org.springframework.stereotype.Component;

@Component
public class HotelMapper {

    public HotelDto toDto(Hotel hotel) {
        return HotelDto.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .address(hotel.getAddress())
                .stars(hotel.getStars())
                .city(hotel.getCity())
                .createdAt(hotel.getCreatedAt())
                .updatedAt(hotel.getUpdatedAt())
                .build();
    }

    public Hotel toEntity(HotelRequest request) {
        return Hotel.builder()
                .name(request.getName())
                .address(request.getAddress())
                .stars(request.getStars())
                .city(request.getCity())
                .build();
    }
}
