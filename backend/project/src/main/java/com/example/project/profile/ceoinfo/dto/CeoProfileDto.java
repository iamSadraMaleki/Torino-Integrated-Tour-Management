package com.example.project.profile.ceoinfo.dto;


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
public class CeoProfileDto {
    private Long id;
    private Long userId;
    private String username;
    private String fullName;
    private String nationalCode;
    private LocalDate birthDate;
    private String phoneNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

