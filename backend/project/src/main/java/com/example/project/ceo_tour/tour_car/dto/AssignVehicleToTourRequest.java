package com.example.project.ceo_tour.tour_car.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignVehicleToTourRequest {

    @NotNull
    private Long vehicleId;
}