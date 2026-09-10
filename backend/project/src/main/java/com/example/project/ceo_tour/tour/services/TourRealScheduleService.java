package com.example.project.ceo_tour.tour.services;

import com.example.project.ceo_tour.tour.dto.ApplyDelayDTO;
import com.example.project.ceo_tour.tour.dto.CreateTourScheduleRequestDTO;
import com.example.project.ceo_tour.tour.dto.TourRealScheduleResponseDTO;

import java.util.List;

public interface TourRealScheduleService {

    List<TourRealScheduleResponseDTO> generateSchedule(
            CreateTourScheduleRequestDTO request);

    List<TourRealScheduleResponseDTO> applyDelay(
            ApplyDelayDTO request);

    List<TourRealScheduleResponseDTO> getByTour(Long tourId);
}
