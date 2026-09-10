package com.example.project.user_reservation.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalTime;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Builder
public class UserTourScheduleItemDto {
    private Long stationId;
    private String stationName;
    private String stationCity;
    private String stationType;
    private Integer orderIndex;
    private LocalDate scheduleDate;
    private LocalTime plannedArrivalTime;
    private LocalTime finalArrivalTime;
}
