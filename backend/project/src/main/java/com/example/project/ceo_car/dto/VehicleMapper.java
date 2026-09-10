package com.example.project.ceo_car.dto;

import com.example.project.ceo_car.model.Vehicle;
import com.example.project.ceo_personel.dto.StaffMemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class VehicleMapper {

    private final VehicleFeatureMapper featureMapper;
    private final StaffMemberMapper staffMemberMapper;

    public VehicleDto toDto(Vehicle vehicle) {
        if (vehicle == null) {
            return null;
        }

        return VehicleDto.builder()
                .id(vehicle.getId())
                .userId(vehicle.getUser().getId())
                .username(vehicle.getUser().getUsername())
                .name(vehicle.getName())
                .manufacturer(vehicle.getManufacturer())
                .type(vehicle.getType())
                .status(vehicle.getStatus())
                .plateNumber(vehicle.getPlateNumber())
                .color(vehicle.getColor())
                .rowCount(vehicle.getRowCount())
                .seatCount(vehicle.getSeatCount())
                .currentDriver(vehicle.getCurrentDriver() != null ?
                        staffMemberMapper.toDto(vehicle.getCurrentDriver()) : null)
                .modelYear(vehicle.getModelYear())
                .description(vehicle.getDescription())
                .features(vehicle.getFeatures().stream()
                        .map(featureMapper::toDto)
                        .collect(Collectors.toSet()))
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }

    public VehicleDto toDtoWithoutDriver(Vehicle vehicle) {
        if (vehicle == null) {
            return null;
        }

        return VehicleDto.builder()
                .id(vehicle.getId())
                .userId(vehicle.getUser().getId())
                .username(vehicle.getUser().getUsername())
                .name(vehicle.getName())
                .manufacturer(vehicle.getManufacturer())
                .type(vehicle.getType())
                .status(vehicle.getStatus())
                .plateNumber(vehicle.getPlateNumber())
                .color(vehicle.getColor())
                .rowCount(vehicle.getRowCount())
                .seatCount(vehicle.getSeatCount())
                .modelYear(vehicle.getModelYear())
                .description(vehicle.getDescription())
                .features(vehicle.getFeatures().stream()
                        .map(featureMapper::toDto)
                        .collect(Collectors.toSet()))
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}
