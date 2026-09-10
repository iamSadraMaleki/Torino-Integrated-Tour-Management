package com.example.project.ceo_personel.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffStatisticsDto {
    private Long totalStaff;
    private Long activeStaff;
    private Long inactiveStaff;
    private Long totalPositions;
    private Map<String, Long> staffByPosition;
}
