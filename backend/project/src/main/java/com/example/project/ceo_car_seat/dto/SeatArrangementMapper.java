package com.example.project.ceo_car_seat.dto;

import com.example.project.ceo_car_seat.model.SeatArrangement;
import org.springframework.stereotype.Component;

@Component
public class SeatArrangementMapper {

    public SeatArrangementDto toDto(SeatArrangement arrangement) {
        if (arrangement == null) {
            return null;
        }

        return SeatArrangementDto.builder()
                .id(arrangement.getId())
                .userId(arrangement.getUser().getId())
                .username(arrangement.getUser().getUsername())
                .pattern(arrangement.getPattern())
                .name(arrangement.getName())
                .description(arrangement.getDescription())
                .isDefault(arrangement.getIsDefault())
                .createdAt(arrangement.getCreatedAt())
                .updatedAt(arrangement.getUpdatedAt())
                .build();
    }
}

