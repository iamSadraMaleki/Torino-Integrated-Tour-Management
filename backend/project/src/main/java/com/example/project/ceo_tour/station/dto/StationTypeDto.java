package com.example.project.ceo_tour.station.dto;


import com.example.project.ceo_tour.station.model.StationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StationTypeDto {
    private Long id;
    private String typeName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static StationTypeDto fromEntity(StationType e) {
        return StationTypeDto.builder()
                .id(e.getId())
                .typeName(e.getTypeName())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}

