package com.example.project.ceo_tour.tour.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TourStationToggleRequest {

    @NotNull
    private Long stationItemId;

    @NotNull
    private Boolean isActive;
    private Integer orderNo;

}
