package com.example.project.ceo_tour.tour_food.services;

import com.example.project.ceo_tour.tour_food.dto.AddTourFoodRequest;
import com.example.project.ceo_tour.tour_food.dto.TourFoodDto;
import com.example.project.ceo_tour.tour_food.dto.TourMenuByDayDto;
import com.example.project.ceo_tour.tour_food.dto.UpdateTourFoodRequest;

import java.util.List;

public interface TourFoodService {

    TourFoodDto add(AddTourFoodRequest request);

    TourFoodDto update(Long id, UpdateTourFoodRequest request);

    void delete(Long id);

    List<TourFoodDto> getByTour(Long tourId);

    TourFoodDto getById(Long id);

    List<TourMenuByDayDto> getMenuGroupedByDay(Long tourId);
}
