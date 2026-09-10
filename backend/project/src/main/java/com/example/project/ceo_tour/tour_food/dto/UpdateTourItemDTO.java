package com.example.project.ceo_tour.tour_food.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateTourItemDTO {

    private String serveDay;

    private BigDecimal price;
}