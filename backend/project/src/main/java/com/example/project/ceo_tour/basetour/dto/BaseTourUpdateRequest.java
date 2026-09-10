package com.example.project.ceo_tour.basetour.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BaseTourUpdateRequest {

    @Size(max = 150)
    private String tourName;

    @Size(max = 50)
    private String tourCode;

    private Long originCityId;
    private Long destinationCityId;
}
