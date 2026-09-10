package com.example.project.ceo_tour.station.dto;

import com.example.project.ceo_tour.station.model.Station;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StationDto {

    private Long id;

    private Long provinceId;
    private String provinceName;

    private Long cityId;
    private String cityName;

    private Long stationTypeId;
    private String stationTypeName;

    private Long stationImageId;

    private String stationName;
    private String location;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static StationDto fromEntity(Station s) {
        return StationDto.builder()
                .id(s.getId())
                .provinceId(s.getProvince().getId())
                .provinceName(s.getProvince().getName())
                .cityId(s.getCity().getId())
                .cityName(s.getCity().getName())
                .stationTypeId(s.getStationType().getId())
                .stationTypeName(s.getStationType().getTypeName())
                .stationImageId(s.getStationImage() != null ? s.getStationImage().getId() : null)
                .stationName(s.getStationName())
                .location(s.getLocation())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}

