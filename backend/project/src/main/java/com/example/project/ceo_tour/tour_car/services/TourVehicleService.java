package com.example.project.ceo_tour.tour_car.services;

import com.example.project.ceo_tour.tour_car.dto.AssignVehicleToTourRequest;
import com.example.project.ceo_tour.tour_car.dto.TourVehicleDto;
import com.example.project.ceo_tour.tour_car.dto.VehicleTourHistoryResponseDTO;

import java.util.List;

public interface TourVehicleService {

    TourVehicleDto assignVehicle(Long tourId, AssignVehicleToTourRequest request);

    void removeVehicle(Long tourId, Long vehicleId);

    List<TourVehicleDto> getTourVehicles(Long tourId);

    /** تاریخچه سفرهای یک خودرو (فقط برای مدیر آژانس صاحب خودرو) */
    List<VehicleTourHistoryResponseDTO> getToursByVehicle(String username, Long vehicleId);
}