package com.example.project.ceo_tour.tour_food.services;

import com.example.project.ceo_tour.tour_food.dto.AddTourDrinkRequest;
import com.example.project.ceo_tour.tour_food.dto.TourDrinkDto;
import com.example.project.ceo_tour.tour_food.dto.UpdateTourDrinkRequest;

import java.util.List;

public interface TourDrinkService {

    TourDrinkDto add(AddTourDrinkRequest request);

    TourDrinkDto update(Long id, UpdateTourDrinkRequest request);

    void delete(Long id);

    List<TourDrinkDto> getByTour(Long tourId);

    TourDrinkDto getById(Long id);
}
