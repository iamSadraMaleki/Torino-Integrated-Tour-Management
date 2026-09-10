package com.example.project.user_reservation.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class HotelDto {
    Long id;
    String name;
    String address;
    Integer stars;
    String city;
}
