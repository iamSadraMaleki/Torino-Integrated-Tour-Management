package com.example.project.ceo_hotel.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class HotelRequest {

    @NotBlank(message = "Hotel name is required")
    @Size(min = 2, max = 100, message = "Hotel name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @NotNull(message = "Stars rating is required")
    @Min(value = 1, message = "Stars must be at least 1")
    @Max(value = 5, message = "Stars must be at most 5")
    private Integer stars;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City name must be at most 100 characters")
    private String city;
}
