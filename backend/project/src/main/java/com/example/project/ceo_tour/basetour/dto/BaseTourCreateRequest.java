package com.example.project.ceo_tour.basetour.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BaseTourCreateRequest {

    @NotBlank
    @Size(max = 150)
    private String tourName;

    @NotBlank
    @Size(max = 50)
    private String tourCode;

    @NotNull
    private Long originCityId;

    @NotNull
    private Long destinationCityId;
}
