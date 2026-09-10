package com.example.project.ceo_tour.basetour.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TourStationsUpsertRequest {

    @Valid
    @NotEmpty
    private List<TourStationItemRequest> items;
}

