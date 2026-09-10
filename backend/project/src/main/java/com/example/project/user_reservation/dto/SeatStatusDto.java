package com.example.project.user_reservation.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SeatStatusDto {
    Long seatId;
    Integer seatNumber;
    Integer rowNumber;
    String position;
    String seatType;
    Boolean isBooked;
    String status; // "AVAILABLE", "PENDING", "CONFIRMED"
}