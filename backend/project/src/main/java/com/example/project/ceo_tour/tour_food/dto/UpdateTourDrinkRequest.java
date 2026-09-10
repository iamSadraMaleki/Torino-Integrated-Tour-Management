package com.example.project.ceo_tour.tour_food.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateTourDrinkRequest {

    @NotBlank(message = "Serve day is required")
    @Size(max = 50, message = "Serve day must be at most 50 characters")
    private String serveDay;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;
}
