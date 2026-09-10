package com.example.project.ceo_tour.tour_insurance.services;

import com.example.project.ceo_tour.tour_insurance.dto.TourInsuranceDto;
import com.example.project.ceo_tour.tour_insurance.dto.TourInsuranceRequest;

import java.util.List;

public interface TourInsuranceService {

    TourInsuranceDto add(TourInsuranceRequest request);

    TourInsuranceDto update(Long id, TourInsuranceRequest request);

    void remove(Long id);

    List<TourInsuranceDto> getByTour(Long tourId);
}
