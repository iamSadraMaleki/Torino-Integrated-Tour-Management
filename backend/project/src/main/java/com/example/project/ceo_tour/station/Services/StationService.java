package com.example.project.ceo_tour.station.Services;


import com.example.project.ceo_tour.station.dto.StationCreateRequest;
import com.example.project.ceo_tour.station.dto.StationDto;
import com.example.project.ceo_tour.station.dto.StationImageDownload;
import com.example.project.ceo_tour.station.dto.StationUpdateRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StationService {

    StationDto create(String username, StationCreateRequest request, MultipartFile image);

    StationDto update(String username, Long stationId, StationUpdateRequest request, MultipartFile image);

    List<StationDto> getMyStations(String username);

    StationDto getById(String username, Long stationId);

    void delete(String username, Long stationId);

    StationImageDownload getImage(String username, Long imageId);
}
