package com.example.project.ceo_car.repair.services;

import com.example.project.ceo_car.repair.dto.VehicleRepairRequest;
import com.example.project.ceo_car.repair.dto.VehicleRepairResponse;
import com.example.project.ceo_car.repair.dto.VehicleRepairStatsResponse;

import java.util.List;

public interface VehicleRepairService {

    VehicleRepairResponse recordRepair(String ceoUsername, VehicleRepairRequest request);

    List<VehicleRepairResponse> getRepairs(String ceoUsername);

    List<VehicleRepairResponse> getRepairsByVehicle(String ceoUsername, Long vehicleId);

    VehicleRepairStatsResponse getStatistics(String ceoUsername);

    void deleteRepair(String ceoUsername, Long repairId);
}
