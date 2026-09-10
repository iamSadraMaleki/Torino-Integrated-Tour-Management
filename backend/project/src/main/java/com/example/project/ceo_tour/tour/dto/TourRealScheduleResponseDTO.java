package com.example.project.ceo_tour.tour.dto;

import lombok.*;

import java.time.*;

@Data
@Builder
public class TourRealScheduleResponseDTO {

    private Long id;

    private Long stationId;

    private String stationCategory;

    private Integer orderIndex;

    private LocalDate scheduleDate;

    private LocalTime plannedArrivalTime;

    private Integer delayMinutes;

    private LocalTime finalArrivalTime;
}