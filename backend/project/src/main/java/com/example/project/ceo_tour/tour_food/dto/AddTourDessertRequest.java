package com.example.project.ceo_tour.tour_food.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class AddTourDessertRequest {

    @NotNull(message = "Tour ID is required")
    private Long tourId;

    @NotNull(message = "Base food ID is required")
    private Long baseFoodId;

    @NotBlank(message = "Serve day is required")
    @Size(max = 50)
    private String serveDay;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;
}
