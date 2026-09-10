package com.example.project.ceo_tour.station.dto;

import com.example.project.ceo_tour.station.model.City;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CityDto {
    private Long id;
    private Long provinceId;
    private String name;
    private String latitude;
    private String longitude;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CityDto fromEntity(City c) {
        return CityDto.builder()
                .id(c.getId())
                .provinceId(c.getProvince().getId())
                .name(c.getName())
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}

