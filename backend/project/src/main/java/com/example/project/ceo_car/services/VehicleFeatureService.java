package com.example.project.ceo_car.services;


import com.example.project.ceo_car.dto.VehicleFeatureDto;
import com.example.project.ceo_car.dto.VehicleFeatureRequest;

import java.util.List;

public interface VehicleFeatureService {

    VehicleFeatureDto createFeature(String username, VehicleFeatureRequest request);

    VehicleFeatureDto updateFeature(String username, Long featureId, VehicleFeatureRequest request);

    void deleteFeature(String username, Long featureId);

    VehicleFeatureDto getFeatureById(String username, Long featureId);

    List<VehicleFeatureDto> getAllFeatures(String username);

    List<VehicleFeatureDto> getActiveFeatures(String username);
}

