package com.example.project.ceo_tour.station.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StationUpdateRequest {

    private Long provinceId;
    private Long cityId;
    private Long stationTypeId;

    @Size(max = 150)
    private String stationName;

    @Size(max = 500)
    private String location;

    @Size(max = 300)
    private String imageDescription;
}
