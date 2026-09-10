package com.example.project.ceo_tour.tour.dto;

import lombok.Data;

@Data
public class ApplyDelayDTO {

    private Long scheduleId;

    private Integer delayMinutes;
}