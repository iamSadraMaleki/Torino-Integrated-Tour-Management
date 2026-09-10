package com.example.project.ceo_tour.tour.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TourStationItemDto {

    private Long id;
    private Long stationId;
    private String stationName;
    private Integer orderNo;
    private Integer minutesToNext;
    private Boolean isActive;
}
