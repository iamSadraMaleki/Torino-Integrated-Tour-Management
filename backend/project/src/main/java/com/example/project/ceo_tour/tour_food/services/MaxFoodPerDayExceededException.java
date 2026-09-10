package com.example.project.ceo_tour.tour_food.services;

public class MaxFoodPerDayExceededException extends RuntimeException {
    public MaxFoodPerDayExceededException(String message) { super(message); }
}
