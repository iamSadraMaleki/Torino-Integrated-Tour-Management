package com.example.project.ceo_tour.basetour.dto;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BaseTourDetailsDto {

    private BaseTourDto tour;

    private List<BaseTourStationItemDto> originStations;
    private List<BaseTourStationItemDto> destinationStations;
    private List<BaseTourStationItemDto> programStations;
}
