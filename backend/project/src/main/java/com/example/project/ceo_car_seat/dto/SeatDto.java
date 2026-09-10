package com.example.project.ceo_car_seat.dto;


import com.example.project.ceo_car_seat.model.SeatType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatDto {
    private Long id;
    private Long userId;
    private String username;
    private Long vehicleId;
    private String vehicleName;
    private String vehiclePlateNumber;
    private Integer seatNumber;
    private Integer rowNumber;
    private String position;
    private SeatType seatType;
    private Boolean isActive;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
