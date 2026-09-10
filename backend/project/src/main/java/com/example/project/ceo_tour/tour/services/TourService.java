package com.example.project.ceo_tour.tour.services;

import com.example.project.ceo_tour.tour.dto.*;
import com.example.project.ceo_tour.tour.model.TourStatus;

import java.util.List;

public interface TourService {

    TourDto create(String username, TourCreateRequest request);
    TourDto update(String username, Long tourId, TourUpdateRequest request);
    void delete(String username, Long tourId);
    List<TourDto> getMyTours(String username);
    TourDetailsDto getDetails(String username, Long tourId);

    void toggleOriginStation(String username, Long tourId, TourStationToggleRequest request);
    void toggleDestinationStation(String username, Long tourId, TourStationToggleRequest request);
    void toggleProgramStation(String username, Long tourId, TourStationToggleRequest request);

    void addOriginStation(String username, Long tourId, TourStationItemDto request);
    void addDestinationStation(String username, Long tourId, TourStationItemDto request);
    void addProgramStation(String username, Long tourId, TourStationItemDto request);
    TourDto changeStatus(String username, Long tourId, TourStatus newStatus);
    List<TourDto> getMyToursByStatus(String username, TourStatus status);

    /** همه تورهای کل سیستم — فقط برای ادمین/سوپرادمین */
    List<TourDto> getAllTours();
}

