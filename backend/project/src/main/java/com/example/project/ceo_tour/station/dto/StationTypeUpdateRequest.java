package com.example.project.ceo_tour.station.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StationTypeUpdateRequest {

    @NotBlank
    @Size(max = 80)
    private String typeName;
}

