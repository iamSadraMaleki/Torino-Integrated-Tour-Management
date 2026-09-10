package com.example.project.ceo_tour.basetour.Services;


import com.example.project.ceo_tour.basetour.dto.*;

import java.util.List;

public interface BaseTourService {

    BaseTourDto create(String username, BaseTourCreateRequest request);

    BaseTourDto update(String username, Long tourId, BaseTourUpdateRequest request);

    void delete(String username, Long tourId);

    List<BaseTourDto> getMyTours(String username);

    BaseTourDetailsDto getDetails(String username, Long tourId);

    void upsertOriginStations(String username, Long tourId, TourStationsUpsertRequest request);

    void upsertDestinationStations(String username, Long tourId, TourStationsUpsertRequest request);

    void upsertProgramStations(String username, Long tourId, TourStationsUpsertRequest request);
}
