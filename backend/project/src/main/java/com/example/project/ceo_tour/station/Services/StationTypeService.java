package com.example.project.ceo_tour.station.Services;

import com.example.project.ceo_tour.station.dto.StationTypeCreateRequest;
import com.example.project.ceo_tour.station.dto.StationTypeDto;
import com.example.project.ceo_tour.station.dto.StationTypeUpdateRequest;

import java.util.List;

public interface StationTypeService {

    StationTypeDto create(String username, StationTypeCreateRequest request);

    List<StationTypeDto> getMyTypes(String username);

    StationTypeDto getById(String username, Long id);

    StationTypeDto update(String username, Long id, StationTypeUpdateRequest request);

    void delete(String username, Long id);
}
