package com.example.project.ceo_tour.tour_insurance.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Value
@Builder
public class TourInsuranceDto {

    Long id;
    Long tourId;
    Long insurancePolicyId;
    String policyName;
    String policyType;
    String policyTypePersian;
    BigDecimal coverageAmount;
    BigDecimal price;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
