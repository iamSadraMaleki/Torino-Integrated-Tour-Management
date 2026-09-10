package com.example.project.ceo_tour.basetour.dto;

import com.example.project.ceo_tour.basetour.model.BaseTour;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BaseTourDto {

    private Long id;
    private String tourName;
    private String tourCode;

    private Long originCityId;
    private Long destinationCityId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BaseTourDto fromEntity(BaseTour t) {
        return BaseTourDto.builder()
                .id(t.getId())
                .tourName(t.getTourName())
                .tourCode(t.getTourCode())
                .originCityId(t.getOriginCity().getId())
                .destinationCityId(t.getDestinationCity().getId())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
