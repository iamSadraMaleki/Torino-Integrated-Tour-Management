package com.example.project.user_reservation.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class VehicleDto {
    Long id;
    String model;
    String plateNumber;
    Integer seatCount;
}
