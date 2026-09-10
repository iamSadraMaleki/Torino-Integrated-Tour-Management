package com.example.project.ceo_tour.tour_car.dto;

import com.example.project.ceo_tour.tour_car.model.TourVehicle;
import org.springframework.stereotype.Component;

@Component
public class TourVehicleMapper {

    public TourVehicleDto toDto(TourVehicle entity) {
        return TourVehicleDto.builder()
                .id(entity.getId())
                .tourId(entity.getTour().getId())
                .vehicleId(entity.getVehicle().getId())
                .vehicleName(entity.getVehicle().getName())
                .build();
    }
}