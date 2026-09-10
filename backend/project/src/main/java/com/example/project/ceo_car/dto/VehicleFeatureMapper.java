package com.example.project.ceo_car.dto;


import com.example.project.ceo_car.model.VehicleFeature;
import org.springframework.stereotype.Component;

@Component
public class VehicleFeatureMapper {

    public VehicleFeatureDto toDto(VehicleFeature feature) {
        if (feature == null) {
            return null;
        }

        return VehicleFeatureDto.builder()
                .id(feature.getId())
                .userId(feature.getUser().getId())
                .username(feature.getUser().getUsername())
                .name(feature.getName())
                .description(feature.getDescription())
                .icon(feature.getIcon())
                .isActive(feature.getIsActive())
                .createdAt(feature.getCreatedAt())
                .updatedAt(feature.getUpdatedAt())
                .build();
    }
}
