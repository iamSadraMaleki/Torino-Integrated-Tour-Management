package com.example.project.ceo_car_seat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatStatisticsDto {
    private Long vehicleId;
    private String vehicleName;
    private Long totalSeats;
    private Long activeSeats;
    private Long inactiveSeats;
    private Long vipSeats;
    private Long regularSeats;
    private Long wheelchairSeats;
    private Long driverSeats;
    private Map<Integer, Long> seatsByRow;
}
