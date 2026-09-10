package com.example.project.ceo_car.dto;


import com.example.project.ceo_car.model.VehicleStatus;
import com.example.project.ceo_car.model.VehicleType;
import com.example.project.ceo_personel.dto.StaffMemberDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDto {
    private Long id;
    private Long userId;
    private String username;
    private String name;
    private String manufacturer;
    private VehicleType type;
    private VehicleStatus status;
    private String plateNumber;
    private String color;
    private Integer rowCount;
    private Integer seatCount;
    private StaffMemberDto currentDriver;
    private Integer modelYear;
    private String description;
    private Set<VehicleFeatureDto> features;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

