package com.example.project.ceo_insurance.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * بیمه‌نامه سفر
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsurancePolicyDto {

    private Long id;
    private String name;
    private String insuranceType;
    private String insuranceTypePersian;
    private BigDecimal coverageAmount;
    private BigDecimal premium;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
