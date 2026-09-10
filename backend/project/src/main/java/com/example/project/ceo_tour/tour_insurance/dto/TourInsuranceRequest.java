package com.example.project.ceo_tour.tour_insurance.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TourInsuranceRequest {

    @NotNull(message = "Tour ID is required")
    private Long tourId;

    @NotNull(message = "Insurance policy ID is required")
    private Long insurancePolicyId;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;
}
