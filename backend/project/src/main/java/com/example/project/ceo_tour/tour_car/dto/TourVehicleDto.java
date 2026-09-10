package com.example.project.ceo_tour.tour_car.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TourVehicleDto {

    Long id;
    Long tourId;
    Long vehicleId;
    String vehicleName;
}
