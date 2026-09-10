package com.example.project.ceo_tour.basetour.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TourStationItemRequest {

    @NotNull
    private Long stationId;

    @NotNull
    @Min(0)
    private Integer orderNo;

    @Min(0)
    private Integer minutesToNext;
}

