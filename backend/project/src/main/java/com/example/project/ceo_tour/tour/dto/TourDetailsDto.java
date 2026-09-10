package com.example.project.ceo_tour.tour.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TourDetailsDto {

    private TourDto tour;
    private List<TourStationItemDto> originStations;
    private List<TourStationItemDto> destinationStations;
    private List<TourStationItemDto> programStations;
}
