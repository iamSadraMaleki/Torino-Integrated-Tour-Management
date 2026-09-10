package com.example.project.ceo_personel.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffMemberDto {
    private Long id;
    private Long userId;
    private String username;
    private PositionDto position;
    private String fullName;
    private String nationalCode;
    private String fatherName;
    private LocalDate birthDate;
    private String phoneNumber;
    private Integer workExperience;
    private String address;
    private Boolean isActive;
    private LocalDate hireDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

