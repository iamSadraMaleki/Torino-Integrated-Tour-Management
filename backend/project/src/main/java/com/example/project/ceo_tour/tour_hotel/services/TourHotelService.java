package com.example.project.ceo_tour.tour_hotel.services;

import com.example.project.ceo_tour.tour_hotel.dto.TourHotelDto;
import com.example.project.ceo_tour.tour_hotel.dto.TourHotelRequest;

import java.util.List;

public interface TourHotelService {

    TourHotelDto addHotelToTour(TourHotelRequest request);

    TourHotelDto updateTourHotel(Long id, TourHotelRequest request);

    void removeHotelFromTour(Long id);

    List<TourHotelDto> getHotelsByTourId(Long tourId);

    TourHotelDto getTourHotelById(Long id);
}

