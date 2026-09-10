package com.example.project.ceo_car.services;



import com.example.project.ceo_car.dto.VehicleDto;
import com.example.project.ceo_car.dto.VehicleRequest;
import com.example.project.ceo_car.dto.VehicleStatisticsDto;
import com.example.project.ceo_car.model.VehicleStatus;
import com.example.project.ceo_car.model.VehicleType;

import java.util.List;

public interface VehicleService {

    VehicleDto createVehicle(String username, VehicleRequest request);

    VehicleDto updateVehicle(String username, Long vehicleId, VehicleRequest request);

    void deleteVehicle(String username, Long vehicleId);

    VehicleDto getVehicleById(String username, Long vehicleId);

    List<VehicleDto> getAllVehicles(String username);

    List<VehicleDto> getVehiclesByStatus(String username, VehicleStatus status);

    List<VehicleDto> getVehiclesByType(String username, VehicleType type);

    VehicleStatisticsDto getStatistics(String username);
}
