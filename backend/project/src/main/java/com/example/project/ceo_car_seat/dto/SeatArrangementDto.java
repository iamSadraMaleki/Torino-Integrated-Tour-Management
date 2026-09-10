package com.example.project.ceo_car_seat.dto;

import com.example.project.ceo_car_seat.model.SeatArrangementPattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatArrangementDto {
    private Long id;
    private Long userId;
    private String username;
    private SeatArrangementPattern pattern;
    private String name;
    private String description;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

