package com.example.project.ceo_car_seat.dto;

import com.example.project.ceo_car_seat.model.Seat;
import org.springframework.stereotype.Component;

@Component
public class SeatMapper {

    public SeatDto toDto(Seat seat) {
        if (seat == null) {
            return null;
        }

        return SeatDto.builder()
                .id(seat.getId())
                .userId(seat.getUser().getId())
                .username(seat.getUser().getUsername())
                .vehicleId(seat.getVehicle().getId())
                .vehicleName(seat.getVehicle().getName())
                .vehiclePlateNumber(seat.getVehicle().getPlateNumber())
                .seatNumber(seat.getSeatNumber())
                .rowNumber(seat.getRowNumber())
                .position(seat.getPosition())
                .seatType(seat.getSeatType())
                .isActive(seat.getIsActive())
                .notes(seat.getNotes())
                .createdAt(seat.getCreatedAt())
                .updatedAt(seat.getUpdatedAt())
                .build();
    }
}

