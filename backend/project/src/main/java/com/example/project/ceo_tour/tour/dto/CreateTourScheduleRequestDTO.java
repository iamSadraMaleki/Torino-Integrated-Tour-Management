package com.example.project.ceo_tour.tour.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateTourScheduleRequestDTO {

    private Long tourId;

    private LocalDate scheduleDate;

    private LocalTime startTime;
}