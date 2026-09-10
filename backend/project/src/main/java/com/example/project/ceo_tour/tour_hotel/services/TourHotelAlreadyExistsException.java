package com.example.project.ceo_tour.tour_hotel.services;

public class TourHotelAlreadyExistsException extends RuntimeException {
    public TourHotelAlreadyExistsException(String message) {
        super(message);
    }
}