package com.example.project.ceo_personel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionDto {
    private Long id;
    private Long userId;
    private String username;
    private String title;
    private String description;
    private Boolean isActive;
    private Long staffCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

