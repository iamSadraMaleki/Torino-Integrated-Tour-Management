package com.example.project.ceo_tour.station.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StationCreateRequest {

    @NotNull
    private Long provinceId;

    @NotNull
    private Long cityId;

    @NotNull
    private Long stationTypeId;

    @NotBlank
    @Size(max = 150)
    private String stationName;

    private String location;

    @Size(max = 300)
    private String imageDescription;
}

