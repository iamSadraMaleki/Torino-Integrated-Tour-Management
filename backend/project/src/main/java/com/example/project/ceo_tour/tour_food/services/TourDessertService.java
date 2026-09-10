package com.example.project.ceo_tour.tour_food.services;


import com.example.project.ceo_tour.tour_food.dto.*;

import java.util.List;

public interface TourDessertService {
    TourDessertDto add(AddTourDessertRequest request);
    TourDessertDto update(Long id, UpdateTourDessertRequest request);
    void delete(Long id);
    List<TourDessertDto> getByTour(Long tourId);
    TourDessertDto getById(Long id);
}
