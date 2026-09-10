package com.example.project.ceo_tour.station.dto;

import com.example.project.ceo_tour.station.model.Province;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProvinceDto {
    private Long id;
    private String name;
    private Integer citiesCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProvinceDto fromEntity(Province p) {
        return ProvinceDto.builder()
                .id(p.getId())
                .name(p.getName())
                .citiesCount(p.getCitiesCount())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}

